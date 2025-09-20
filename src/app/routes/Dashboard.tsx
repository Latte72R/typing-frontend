import { Link } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer.tsx';
import { useContestsQuery } from '@/features/contest/api/contestQueries.ts';
import styles from './Dashboard.module.css';

export const Dashboard = () => {
  const { data, isLoading, error } = useContestsQuery();
  const contests = Array.isArray(data) ? data : [];

  return (
    <PageContainer
      title="ダッシュボード"
      description="参加可能なコンテストと最近の成績を確認できます"
    >
      <section aria-label="コンテスト一覧" className={styles.contestList}>
        {isLoading ? <p>読み込み中...</p> : null}
        {error ? <p role="alert">コンテスト一覧の取得に失敗しました。</p> : null}
        {!isLoading && !error && contests.length === 0 ? (
          <p>
            現在、参加可能なコンテストがありません。バックエンドが起動しているか確認し、管理者の方は管理コンソールから新しいコンテストを作成して再度読み込んでください。
          </p>
        ) : null}
        {contests.map((contest) => (
          <article key={contest.id} className={styles.card}>
            <h2>{contest.title}</h2>
            <p>{contest.description}</p>
            <dl className={styles.meta}>
              <div>
                <dt>時間制限</dt>
                <dd>{contest.timeLimitSec} 秒</dd>
              </div>
              <div>
                <dt>最大試行</dt>
                <dd>{contest.maxAttempts === 0 ? '無制限' : `${contest.maxAttempts} 回`}</dd>
              </div>
              <div>
                <dt>公開範囲</dt>
                <dd>{contest.visibility === 'public' ? '公開' : '非公開'}</dd>
              </div>
            </dl>
            <div className={styles.actions}>
              <Link to={`/contests/${contest.id}`}>詳細</Link>
              <Link to={`/typing/${contest.id}`}>今すぐ挑戦</Link>
            </div>
          </article>
        ))}
      </section>
    </PageContainer>
  );
};
