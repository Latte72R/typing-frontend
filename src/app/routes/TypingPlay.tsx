import { type KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer.tsx';
import { KeyStats } from '@/components/typing/KeyStats.tsx';
import { LeaderboardWidget } from '@/components/typing/LeaderboardWidget.tsx';
import { Timer } from '@/components/typing/Timer.tsx';
import { TypingCanvas } from '@/components/typing/TypingCanvas.tsx';
import {
  useContestQuery,
  useFinishSessionMutation,
  useStartSessionMutation,
} from '@/features/contest/api/contestQueries.ts';
import {
  calculateAccuracy,
  calculateAnomalyScore,
  calculateCpm,
  calculateScore,
  calculateWpm,
} from '@/lib/keyboard/typingUtils.ts';
import type { FinishSessionReq, KeyLogEntry, SessionResult, StartSessionRes } from '@/types/api.ts';
import styles from './TypingPlay.module.css';

export const TypingPlay = () => {
  const { contestId = '' } = useParams();
  const { data: contest } = useContestQuery(contestId, Boolean(contestId));
  const startSession = useStartSessionMutation();
  const finishSession = useFinishSessionMutation();
  const navigate = useNavigate();

  const [session, setSession] = useState<StartSessionRes | null>(null);
  const [cursor, setCursor] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [keyLog, setKeyLog] = useState<KeyLogEntry[]>([]);
  const [keyIntervals, setKeyIntervals] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [defocusCount, setDefocusCount] = useState(0);
  const [pasteBlocked] = useState(true);
  const [focusWarning, setFocusWarning] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const focusRef = useRef<HTMLDivElement | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastKeyTimeRef = useRef<number | null>(null);
  const finishedRef = useRef(false);

  const typingTarget = session?.prompt.typingTarget ?? '';
  const displayText = session?.prompt.displayText ?? 'セッションを開始するとお題が表示されます。';

  const accuracy = useMemo(
    () => calculateAccuracy(correctCount, correctCount + errorCount),
    [correctCount, errorCount],
  );
  const cpm = useMemo(() => {
    const timeLimit = contest?.timeLimitSec ?? 60;
    const elapsed = Math.max(timeLimit - remainingSeconds, 1);
    return calculateCpm(correctCount, elapsed);
  }, [correctCount, contest?.timeLimitSec, remainingSeconds]);
  const wpm = useMemo(() => calculateWpm(cpm), [cpm]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setDefocusCount((value) => value + 1);
        setFocusWarning(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  useEffect(() => {
    if (contest && !session) {
      setRemainingSeconds(contest.timeLimitSec);
    }
  }, [contest, session]);

  const resetState = (nextSession: StartSessionRes) => {
    setSession(nextSession);
    setCursor(0);
    setCorrectCount(0);
    setErrorCount(0);
    setKeyLog([]);
    setKeyIntervals([]);
    setIsRunning(true);
    setHasError(false);
    setRemainingSeconds(contest?.timeLimitSec ?? 0);
    setDefocusCount(0);
    setFocusWarning(false);
    setSubmitError(null);
    startTimeRef.current = performance.now();
    lastKeyTimeRef.current = null;
    finishedRef.current = false;
    window.requestAnimationFrame(() => {
      focusRef.current?.focus();
    });
  };

  const handleStartSession = () => {
    if (!contestId) return;
    setSubmitError(null);
    startSession.mutate(contestId, {
      onSuccess: resetState,
      onError: (error) => {
        setSubmitError(error.message ?? 'セッションを開始できませんでした。');
      },
    });
  };

  const handleFinish = useCallback(() => {
    if (!session || finishedRef.current) {
      return;
    }
    finishedRef.current = true;
    setIsRunning(false);
    const now = performance.now();
    const timeLimit = contest?.timeLimitSec ?? Number.POSITIVE_INFINITY;
    const elapsedSeconds = Math.max(
      1,
      Math.min(timeLimit, startTimeRef.current ? (now - startTimeRef.current) / 1000 : timeLimit),
    );
    const totalTyped = correctCount + errorCount;
    const accuracyValue = calculateAccuracy(correctCount, totalTyped);
    const cpmValue = calculateCpm(correctCount, elapsedSeconds);
    const wpmValue = calculateWpm(cpmValue);
    const score = calculateScore(cpmValue, accuracyValue);
    const anomalyScore = calculateAnomalyScore(keyIntervals);

    const request: FinishSessionReq = {
      cpm: cpmValue,
      wpm: wpmValue,
      accuracy: accuracyValue,
      errors: errorCount,
      keylog: keyLog,
      clientFlags: {
        defocus: defocusCount,
        pasteBlocked,
        anomalyScore,
      },
    };

    const optimisticResult: SessionResult = {
      sessionId: session.sessionId,
      contestId: session.contestId,
      ...request,
      completedAt: new Date().toISOString(),
      score,
    };

    setSubmitError(null);

    finishSession.mutate(
      { sessionId: session.sessionId, contestId: session.contestId, request },
      {
        onSuccess: (data) => {
          const nextResult = data ?? optimisticResult;
          navigate(`/result/${session.sessionId}`, { state: { result: nextResult, contest } });
        },
        onError: (error) => {
          console.error('セッション結果の送信に失敗しました', error);
          finishedRef.current = false;
          setSubmitError('結果の送信に失敗しました。ネットワーク状態を確認して再試行してください。');
        },
      },
    );
  }, [
    contest,
    correctCount,
    defocusCount,
    errorCount,
    finishSession,
    keyIntervals,
    keyLog,
    navigate,
    pasteBlocked,
    session,
  ]);

  useEffect(() => {
    if (session && cursor >= typingTarget.length && typingTarget.length > 0) {
      handleFinish();
    }
  }, [cursor, handleFinish, session, typingTarget.length]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!session || !isRunning) return;
    if (event.nativeEvent.isComposing) return;

    const { key, ctrlKey, metaKey, altKey } = event;

    if (ctrlKey || metaKey || altKey) {
      return;
    }

    if (key === 'Tab') {
      event.preventDefault();
      setDefocusCount((value) => value + 1);
      setFocusWarning(true);
      return;
    }

    if (key === 'Backspace') {
      event.preventDefault();
      if (!contest?.allowBackspace) {
        setHasError(true);
        setErrorCount((value) => value + 1);
        return;
      }
      if (cursor > 0) {
        setCursor((value) => value - 1);
        setCorrectCount((value) => Math.max(value - 1, 0));
      }
      return;
    }

    if (key.length !== 1) {
      return;
    }

    if (cursor >= typingTarget.length) {
      return;
    }

    event.preventDefault();

    const expectedChar = typingTarget[cursor];
    const timestamp = performance.now();
    const lastKeyTime = lastKeyTimeRef.current;
    if (lastKeyTime != null) {
      setKeyIntervals((prev) => [...prev, timestamp - lastKeyTime]);
    }
    lastKeyTimeRef.current = timestamp;

    const isCorrect = key === expectedChar;
    setKeyLog((prev) => [
      ...prev,
      {
        t: startTimeRef.current ? Math.round(timestamp - startTimeRef.current) : 0,
        k: key,
        ok: isCorrect,
      },
    ]);

    if (isCorrect) {
      setCursor((value) => value + 1);
      setCorrectCount((value) => value + 1);
      setHasError(false);
    } else {
      setHasError(true);
      setErrorCount((value) => value + 1);
    }
  };

  const handleFocus = () => {
    setFocusWarning(false);
  };

  const handleBlur = () => {
    setDefocusCount((value) => value + 1);
    setFocusWarning(true);
  };

  const allowInput = Boolean(session && isRunning);

  return (
    <PageContainer
      title="タイピングプレイ"
      description={contest ? `${contest.title} - 残り時間 ${remainingSeconds}s` : 'コンテストを選択してください'}
      actions={
        <button type="button" className={styles.primaryButton} onClick={handleStartSession}>
          {session ? '再挑戦' : 'セッション開始'}
        </button>
      }
    >
      <div className={styles.layout}>
        <div className={styles.mainColumn}>
          <div
            ref={focusRef}
            className={styles.inputSurface}
            tabIndex={0}
            role="application"
            aria-label="タイピング入力面"
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onPaste={(event) => {
              event.preventDefault();
            }}
            onDrop={(event) => {
              event.preventDefault();
            }}
          >
            <TypingCanvas
              displayText={displayText}
              typingTarget={typingTarget}
              cursorIndex={cursor}
              hasError={hasError}
            />
          </div>
          <div className={styles.panelRow}>
            <Timer
              duration={contest?.timeLimitSec ?? 60}
              isRunning={allowInput}
              onExpire={handleFinish}
              onTick={setRemainingSeconds}
              resetKey={session?.sessionId}
            />
            <KeyStats
              cpm={cpm}
              wpm={wpm}
              accuracy={accuracy}
              errors={errorCount}
              remainingSeconds={remainingSeconds}
            />
          </div>
          {focusWarning ? (
            <p className={styles.warning} role="alert">
              フォーカスが外れました。戻って続行してください。（回数: {defocusCount}）
            </p>
          ) : null}
          {submitError ? (
            <p className={styles.error} role="alert">
              {submitError}
            </p>
          ) : null}
        </div>
        <aside className={styles.sidebar}>
          <LeaderboardWidget contestId={contestId} />
          <div className={styles.metaBox}>
            <h2>セッション状態</h2>
            <dl>
              <div>
                <dt>入力可</dt>
                <dd>{allowInput ? 'はい' : 'いいえ'}</dd>
              </div>
              <div>
                <dt>フォーカス逸脱</dt>
                <dd>{defocusCount} 回</dd>
              </div>
              <div>
                <dt>ログ記録数</dt>
                <dd>{keyLog.length}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </PageContainer>
  );
};
