import { FormEvent, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer.tsx';
import { useContestQuery } from '@/features/contest/api/contestQueries.ts';
import styles from './ContestLobby.module.css';

export const ContestLobby = () => {
  const { contestId = '' } = useParams();
  const { data: contest, isLoading } = useContestQuery(contestId, Boolean(contestId));
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (contest?.visibility === 'private' && code.trim() === '') {
      setMessage('参加コードを入力してください');
      return;
    }
    setMessage('デモ環境のため、参加リクエストは送信されません。');
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
      {!contest && !isLoading ? <p>コンテストが見つかりません。</p> : null}
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
              <button type="submit">参加登録</button>
              {message ? <p role="status">{message}</p> : null}
            </form>
          </section>
        </div>
      ) : null}
    </PageContainer>
  );
};
