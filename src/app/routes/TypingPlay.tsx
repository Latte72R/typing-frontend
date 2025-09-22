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
  useNextPromptMutation,
  useStartSessionMutation,
} from '@/features/contest/api/contestQueries.ts';
import {
  calculateAccuracy,
  calculateAnomalyScore,
  calculateCpm,
  calculateScore,
  calculateWpm,
} from '@/lib/keyboard/typingUtils.ts';
import type { FinishSessionReq, KeyLogEntry, Prompt, SessionResult, StartSessionRes } from '@/types/api.ts';
import styles from './TypingPlay.module.css';

export const TypingPlay = () => {
  const { contestId = '' } = useParams();
  const { data: contest } = useContestQuery(contestId, Boolean(contestId));
  const startSession = useStartSessionMutation();
  const finishSession = useFinishSessionMutation();
  const nextPrompt = useNextPromptMutation();
  const navigate = useNavigate();

  const [session, setSession] = useState<StartSessionRes | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [currentOrder, setCurrentOrder] = useState(0);
  const [cursor, setCursor] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [keyLog, setKeyLog] = useState<KeyLogEntry[]>([]);
  const [keyIntervals, setKeyIntervals] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isAdvancingPrompt, setIsAdvancingPrompt] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [defocusCount, setDefocusCount] = useState(0);
  const [pasteBlocked] = useState(true);
  const [focusWarning, setFocusWarning] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<SessionResult | null>(null);
  const [autoNext, setAutoNext] = useState(true);

  const focusRef = useRef<HTMLDivElement | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastKeyTimeRef = useRef<number | null>(null);
  const finishedRef = useRef(false);
  const initialStartRef = useRef(false);
  const autoNextRef = useRef(autoNext);
  const autoStartRef = useRef(false);

  useEffect(() => {
    autoNextRef.current = autoNext;
  }, [autoNext]);

  const typingTarget = currentPrompt?.typingTarget ?? '';
  const displayText = currentPrompt?.displayText ?? 'セッションを開始するとお題が表示されます。';

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

  const resetState = useCallback((nextSession: StartSessionRes) => {
    setSession(nextSession);
    setCurrentPrompt(nextSession.prompt);
    setCurrentOrder(nextSession.orderIndex ?? 0);
    setCursor(0);
    setCorrectCount(0);
    setErrorCount(0);
    setKeyLog([]);
    setKeyIntervals([]);
    setIsRunning(true);
    setIsAdvancingPrompt(false);
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
  }, [contest?.timeLimitSec]);

  const handleStartSession = useCallback(async () => {
    if (startSession.isPending) {
      return;
    }
    if (!contestId) return;
    setSubmitError(null);
    try {
      const nextSession = await startSession.mutateAsync(contestId);
      autoStartRef.current = true;
      resetState(nextSession);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'セッションを開始できませんでした。');
      autoStartRef.current = false;
    }
  }, [contestId, resetState, startSession]);

  useEffect(() => {
    if (!contestId || initialStartRef.current) {
      return;
    }
    initialStartRef.current = true;
    void handleStartSession();
  }, [contestId, handleStartSession]);

  const handleFinish = useCallback(() => {
    if (!session || finishedRef.current) {
      return;
    }
    finishedRef.current = true;
    setIsAdvancingPrompt(false);
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
      score,
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
          setLastResult(nextResult);
          if (autoNextRef.current) {
            void handleStartSession();
          } else {
            autoStartRef.current = false;
            setSession(null);
            setCurrentPrompt(null);
            setCurrentOrder(0);
          }
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
    handleStartSession,
    keyIntervals,
    keyLog,
    pasteBlocked,
    session,
  ]);

  const advancePrompt = useCallback(async () => {
    if (!session || !currentPrompt || finishedRef.current) {
      return;
    }
    if (isAdvancingPrompt || nextPrompt.isPending) {
      return;
    }
    setIsAdvancingPrompt(true);
    setCursor(0);
    setHasError(false);
    setCurrentPrompt(null);
    lastKeyTimeRef.current = null;
    try {
      const result = await nextPrompt.mutateAsync(session.sessionId);
      setCurrentPrompt(result.prompt);
      setCurrentOrder(result.orderIndex);
      window.requestAnimationFrame(() => {
        focusRef.current?.focus();
      });
    } catch (error) {
      console.error('次のプロンプト取得に失敗しました', error);
      setSubmitError('次の問題を取得できませんでした。結果を保存します。');
      handleFinish();
    } finally {
      setIsAdvancingPrompt(false);
    }
  }, [
    currentPrompt,
    handleFinish,
    isAdvancingPrompt,
    nextPrompt,
    session,
  ]);

  useEffect(() => {
    if (!session || !currentPrompt) {
      return;
    }
    if (!isRunning || finishedRef.current) {
      return;
    }
    const targetLength = currentPrompt.typingTarget.length;
    if (targetLength === 0) {
      return;
    }
    if (cursor < targetLength) {
      return;
    }
    if (remainingSeconds <= 0) {
      handleFinish();
      return;
    }
    void advancePrompt();
  }, [
    advancePrompt,
    currentPrompt,
    cursor,
    handleFinish,
    isRunning,
    remainingSeconds,
    session,
  ]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!session || !isRunning || !currentPrompt) return;
    if (isAdvancingPrompt) {
      event.preventDefault();
      return;
    }
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

  const isActiveSession = Boolean(session && isRunning);
  const allowInput = Boolean(isActiveSession && !isAdvancingPrompt);

  return (
    <PageContainer
      title="タイピングプレイ"
      description={contest ? `${contest.title} - 残り時間 ${remainingSeconds}s` : 'コンテストを選択してください'}
      actions={
        <button
          type="button"
          className={styles.primaryButton}
          onClick={handleStartSession}
          disabled={isRunning || startSession.isPending}
        >
          {isRunning ? 'タイピング中…' : session ? '次の問題を始める' : 'セッション開始'}
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
              isRunning={isActiveSession}
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
          <section className={styles.resultPanel} aria-label="直近の結果">
            <div className={styles.resultPanelHeader}>
              <h2>直近の結果</h2>
              <label className={styles.autoToggle}>
                <input
                  type="checkbox"
                  checked={autoNext}
                  onChange={(event) => setAutoNext(event.target.checked)}
                />
                次の問題を自動で出す
              </label>
            </div>
            {lastResult ? (
              <div className={styles.resultSummary}>
                <p><span>スコア</span><strong>{Math.round(lastResult.score)}</strong></p>
                <p><span>正確率</span><strong>{(lastResult.accuracy * 100).toFixed(1)}%</strong></p>
                <p><span>ミス</span><strong>{lastResult.errors}</strong></p>
                <div className={styles.resultActions}>
                  <button
                    type="button"
                    onClick={() => navigate(`/result/${lastResult.sessionId}`, { state: { result: lastResult, contest } })}
                  >
                    詳細を見る
                  </button>
                </div>
              </div>
            ) : (
              <p className={styles.resultPlaceholder}>まだ結果がありません。</p>
            )}
          </section>
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
                <dt>出題番号</dt>
                <dd>{session ? currentOrder + 1 : '-'}</dd>
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
