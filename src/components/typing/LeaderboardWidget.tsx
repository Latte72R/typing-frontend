import { useLeaderboardQuery } from '@/features/contest/api/contestQueries.ts';
import styles from './LeaderboardWidget.module.css';

type LeaderboardWidgetProps = {
  contestId: string;
};

export const LeaderboardWidget = ({ contestId }: LeaderboardWidgetProps) => {
  const { data, isLoading, error } = useLeaderboardQuery(contestId, Boolean(contestId));

  if (isLoading) {
    return <p>ランキングを取得しています...</p>;
  }

  if (error) {
    return <p role="alert">ランキングの取得に失敗しました。</p>;
  }

  if (!data) {
    return <p>ランキング情報がありません。</p>;
  }

  return (
    <section className={styles.leaderboard} aria-label="暫定ランキング">
      <header className={styles.header}>
        <h2>Leaderboard</h2>
        <span className={styles.caption}>自動更新（5秒間隔）</span>
      </header>
      <ol className={styles.list}>
        {data.top.map((entry) => (
          <li key={entry.rank} className={styles.item}>
            <span className={styles.rank}>{entry.rank}</span>
            <span className={styles.user}>{entry.user}</span>
            <span className={styles.score}>{entry.score}</span>
            <span className={styles.metrics}>{entry.cpm}cpm / {(entry.accuracy * 100).toFixed(1)}%</span>
          </li>
        ))}
      </ol>
    </section>
  );
};
