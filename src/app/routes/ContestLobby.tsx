import { type FormEvent, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer.tsx';
import { useAuth } from '@/features/auth/contexts/AuthContext.tsx';
import {
  useContestQuery,
  useJoinContestMutation,
} from '@/features/contest/api/contestQueries.ts';
import { ContestPromptManager } from '@/features/contest/components/ContestPromptManager.tsx';
import styles from './ContestLobby.module.css';

const leaderboardVisibilityLabels: Record<string, string> = {
  during: '期間中公開',
  after: '終了後公開',
  hidden: '非公開',
};

export const ContestLobby = () => {
  const { contestId = '' } = useParams();
  const { user } = useAuth();
  const { data: contest, isLoading, error } = useContestQuery(contestId, Boolean(contestId));
  const joinContest = useJoinContestMutation();
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const requiresJoinCode = contest?.visibility === 'private';
  const canManagePrompts = Boolean(user && user.role === 'admin' && contestId);

  const leaderboardVisibilityLabel = useMemo(() => {
    if (!contest) return '';
    return leaderboardVisibilityLabels[contest.leaderboardVisibility] ?? contest.leaderboardVisibility;
  }, [contest]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!contestId) {
      setFeedback({ type: 'error', message: 'コンテストIDが無効です。' });
      return;
    }
    if (requiresJoinCode && code.trim() === '') {
      setFeedback({ type: 'error', message: '参加コードを入力してください。' });
      return;
    }
    setFeedback(null);
    joinContest.mutate(
      { contestId, joinCode: code.trim() || undefined },
      {
        onSuccess: () => {
          setCode('');
          setFeedback({ type: 'success', message: '参加登録が完了しました。' });
        },
        onError: (joinError) => {
          setFeedback({ type: 'error', message: joinError.message ?? '参加登録に失敗しました。' });
        },
      },
    );
  };

  return (
    <PageContainer
      title={contest?.title ?? 'コンテスト情報'}
      description={contest?.description ?? 'コンテストの概要と参加条件を確認します'}
      actions={
        contest ? (
          <Link className={styles.primaryAction} to={`/typing/${contest.id}`}>
            セッションを開始
          </Link>
        ) : undefined
      }
    >
      {isLoading ? <p>読み込み中...</p> : null}
      {error ? <p role="alert">コンテスト情報の取得に失敗しました。</p> : null}
      {!contest && !isLoading && !error ? <p>コンテストが見つかりません。</p> : null}
      {contest ? (
        <div className={styles.grid}>
          <section>
            <h2>ルール概要</h2>
            <dl className={styles.detailList}>
              <div>
                <dt>制限時間</dt>
                <dd>{contest.timeLimitSec != null ? `${contest.timeLimitSec} 秒` : '未設定'}</dd>
              </div>
              <div>
                <dt>Backspace</dt>
                <dd>{contest.allowBackspace ? '使用可' : '使用不可'}</dd>
              </div>
              <div>
                <dt>ランキング公開</dt>
                <dd>{leaderboardVisibilityLabel}</dd>
              </div>
            </dl>
          </section>
          <section>
            <h2>参加登録</h2>
            <form className={styles.joinForm} onSubmit={handleSubmit}>
              {requiresJoinCode ? (
                <>
                  <label htmlFor="join-code">参加コードを入力</label>
                  <input
                    id="join-code"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    placeholder="コード必須"
                    aria-required={true}
                  />
                </>
              ) : (
                <p className={styles.joinNotice}>このコンテストは公開されています。参加コードは不要です。</p>
              )}
              <button type="submit" disabled={joinContest.isPending}>
                {joinContest.isPending ? '送信中...' : '参加登録'}
              </button>
              {feedback ? (
                <p
                  className={`${styles.feedback} ${feedback.type === 'error' ? styles.feedbackError : styles.feedbackSuccess}`}
                  role={feedback.type === 'error' ? 'alert' : 'status'}
                >
                  {feedback.message}
                </p>
              ) : null}
            </form>
          </section>
        </div>
      ) : null}

      {contest && canManagePrompts ? <ContestPromptManager contestId={contest.id} /> : null}
    </PageContainer>
  );
};
