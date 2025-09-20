import { type FormEvent, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer.tsx';
import { useContestQuery, useJoinContestMutation } from '@/features/contest/api/contestQueries.ts';
import styles from './ContestLobby.module.css';

export const ContestLobby = () => {
  const { contestId = '' } = useParams();
  const { data: contest, isLoading, error } = useContestQuery(contestId, Boolean(contestId));
  const joinContest = useJoinContestMutation();
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!contestId) {
      setFeedback({ type: 'error', message: 'コンテストIDが無効です。' });
      return;
    }
    if (contest?.visibility === 'private' && code.trim() === '') {
      setFeedback({ type: 'error', message: '参加コードを入力してください。' });
      return;
    }
    setFeedback(null);
    joinContest.mutate(
      { contestId, joinCode: code.trim() || undefined },
      {
        onSuccess: () => {
          setFeedback({ type: 'success', message: '参加登録が完了しました。' });
        },
        onError: (error) => {
          setFeedback({ type: 'error', message: error.message ?? '参加登録に失敗しました。' });
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
                <dd>{contest.timeLimitSec} 秒</dd>
              </div>
              <div>
                <dt>最大試行回数</dt>
                <dd>{contest.maxAttempts === 0 ? '無制限' : `${contest.maxAttempts} 回`}</dd>
              </div>
              <div>
                <dt>Backspace</dt>
                <dd>{contest.allowBackspace ? '使用可' : '使用不可'}</dd>
              </div>
              <div>
                <dt>公開設定</dt>
                <dd>{contest.leaderboardVisibility}</dd>
              </div>
            </dl>
          </section>
          <section>
            <h2>参加コード</h2>
            <form className={styles.joinForm} onSubmit={handleSubmit}>
              <label htmlFor="join-code">参加コードを入力</label>
              <input
                id="join-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder={contest.visibility === 'private' ? 'コード必須' : '公開コンテスト'}
                aria-required={contest.visibility === 'private'}
              />
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
    </PageContainer>
  );
};
