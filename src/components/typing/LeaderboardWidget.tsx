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

  const me = data.me ?? null;
  const personalEntry = me && !data.top.some((entry) => entry.sessionId === me.sessionId) ? me : null;

  const renderUserName = (username?: string) => username ?? '匿名ユーザー';

  return (
    <section className={styles.leaderboard} aria-label="暫定ランキング">
      <header className={styles.header}>
        <h2>Leaderboard</h2>
        <span className={styles.caption}>自動更新（5秒間隔）</span>
      </header>
      <ol className={styles.list}>
        {data.top.map((entry) => (
          <li key={entry.sessionId} className={styles.item}>
            <span className={styles.rank}>{entry.rank}</span>
            <span className={styles.user}>{renderUserName(entry.username)}</span>
            <span className={styles.score}>{entry.score}</span>
            <span className={styles.metrics}>{entry.cpm}cpm / {(entry.accuracy * 100).toFixed(1)}%</span>
          </li>
        ))}
        {personalEntry ? (
          <li key={personalEntry.sessionId} className={`${styles.item} ${styles.personal}`}>
            <span className={styles.rank}>{personalEntry.rank}</span>
            <span className={styles.user}>{renderUserName(personalEntry.username)}（あなた）</span>
            <span className={styles.score}>{personalEntry.score}</span>
            <span className={styles.metrics}>{personalEntry.cpm}cpm / {(personalEntry.accuracy * 100).toFixed(1)}%</span>
          </li>
        ) : null}
      </ol>
      <footer className={styles.footer}>
        <span>記録総数: {data.total}</span>
      </footer>
    </section>
  );
};
