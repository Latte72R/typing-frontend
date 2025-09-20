import { Link } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer.tsx';
import { useContestsQuery } from '@/features/contest/api/contestQueries.ts';
import styles from './Dashboard.module.css';

export const Dashboard = () => {
  const { data, isLoading } = useContestsQuery();

  return (
    <PageContainer
      title="ダッシュボード"
      description="参加可能なコンテストと最近の成績を確認できます"
    >
      <section aria-label="コンテスト一覧" className={styles.contestList}>
        {isLoading ? <p>読み込み中...</p> : null}
        {data?.map((contest) => (
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
