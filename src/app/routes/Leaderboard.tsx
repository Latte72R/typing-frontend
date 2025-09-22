import { type ChangeEvent, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer.tsx';
import { useContestsQuery, useLeaderboardQuery } from '@/features/contest/api/contestQueries.ts';
import styles from './Leaderboard.module.css';

type RouteParams = { contestId?: string };

export const Leaderboard = () => {
  const { contestId = '' } = useParams<RouteParams>();
  const navigate = useNavigate();
  const { data: contests, isLoading: contestsLoading, error: contestsError } = useContestsQuery();
  const contestOptions = useMemo(() => {
    return (contests ?? []).filter((contest) => contest.leaderboardVisibility !== 'hidden');
  }, [contests]);

  const activeContest = useMemo(() => {
    return contestOptions.find((contest) => contest.id === contestId) ?? null;
  }, [contestId, contestOptions]);

  useEffect(() => {
    if (!contestId && contestOptions.length > 0) {
      navigate(`/leaderboard/${contestOptions[0]?.id ?? ''}`, { replace: true });
    }
  }, [contestId, contestOptions, navigate]);

  const { data, isLoading, error } = useLeaderboardQuery(contestId, Boolean(contestId));
  const showTable = Boolean(data && data.top.length > 0);
  const me = data?.me ?? null;
  const personalEntry = me && data
    ? (data.top.some((entry) => entry.sessionId === me.sessionId) ? null : me)
    : null;

  const renderUserName = (username?: string) => username ?? '匿名ユーザー';
  const showUnknownOption = Boolean(contestId && !activeContest);

  const handleContestChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (!value) {
      navigate('/leaderboard');
    } else {
      navigate(`/leaderboard/${value}`);
    }
  };

  return (
    <PageContainer
      title="Leaderboard"
      description={activeContest ? activeContest.title : 'コンテストを選択してください'}
    >
      <div className={styles.controls}>
        <label htmlFor="leaderboard-contest">コンテスト</label>
        <select
          id="leaderboard-contest"
          value={contestId}
          onChange={handleContestChange}
          disabled={contestsLoading || contestOptions.length === 0}
        >
          <option value="">{contestsLoading ? '読み込み中...' : 'コンテストを選択'}</option>
          {showUnknownOption ? (
            <option value={contestId}>{`${contestId} (表示不可)`}</option>
          ) : null}
          {contestOptions.map((contest) => (
            <option key={contest.id} value={contest.id}>
              {contest.title}
            </option>
          ))}
        </select>
      </div>

      {contestsError ? (
        <p role="alert" className={styles.error}>コンテスト一覧を取得できませんでした。</p>
      ) : null}

      {contestId ? (
        <>
          {isLoading ? <p>読み込み中...</p> : null}
          {error ? (
            <p role="alert" className={styles.error}>
              {error instanceof Error ? error.message : 'ランキングを取得できませんでした。'}
            </p>
          ) : null}
          {!isLoading && !error && !showTable ? (
            <p className={styles.empty}>ランキング情報がまだありません。</p>
          ) : null}
          {showTable ? (
            <table className={styles.table}>
              <caption>上位10名のスコア（記録総数: {data?.total ?? 0}）</caption>
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
                {data?.top.map((entry) => (
                  <tr key={entry.sessionId}>
                    <td>{entry.rank}</td>
                    <td>{renderUserName(entry.username)}</td>
                    <td>{entry.score}</td>
                    <td>{entry.cpm}</td>
                    <td>{(entry.accuracy * 100).toFixed(1)}%</td>
                  </tr>
                ))}
                {personalEntry ? (
                  <tr key={personalEntry.sessionId} className={styles.personalRow}>
                    <td>{personalEntry.rank}</td>
                    <td>{renderUserName(personalEntry.username)}（あなた）</td>
                    <td>{personalEntry.score}</td>
                    <td>{personalEntry.cpm}</td>
                    <td>{(personalEntry.accuracy * 100).toFixed(1)}%</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          ) : null}
        </>
      ) : null}
    </PageContainer>
  );
};
