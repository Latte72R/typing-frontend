import { useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer.tsx';
import { useLeaderboardQuery } from '@/features/contest/api/contestQueries.ts';
import styles from './Leaderboard.module.css';

export const Leaderboard = () => {
  const { contestId = '' } = useParams();
  const { data, isLoading, error } = useLeaderboardQuery(contestId, Boolean(contestId));

  return (
    <PageContainer
      title="Leaderboard"
      description={contestId ? `コンテストID: ${contestId}` : 'コンテストを選択してください'}
    >
      {isLoading ? <p>読み込み中...</p> : null}
      {error ? <p role="alert">ランキングを取得できませんでした。</p> : null}
      {data ? (
        <table className={styles.table}>
          <caption>上位10名のスコア</caption>
          <thead>
            <tr>
              <th scope="col">順位</th>
              <th scope="col">ユーザー</th>
              <th scope="col">スコア</th>
              <th scope="col">CPM</th>
              <th scope="col">正確率</th>
            </tr>
          </thead>
          <tbody>
            {data.top.map((entry) => (
              <tr key={entry.rank}>
                <td>{entry.rank}</td>
                <td>{entry.user}</td>
                <td>{entry.score}</td>
                <td>{entry.cpm}</td>
                <td>{(entry.accuracy * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </PageContainer>
  );
};
