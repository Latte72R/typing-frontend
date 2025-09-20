import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';
import {
  fetchContest,
  fetchContests,
  fetchLeaderboard,
  finishContestSession,
  startContestSession,
} from './mockContestService.ts';
import { LeaderboardPayload, SessionResult, StartSessionRes } from '@/types/api.ts';

const contestKeys = {
  all: ['contests'] as const,
  detail: (contestId: string) => [...contestKeys.all, contestId] as const,
  leaderboard: (contestId: string) => [...contestKeys.detail(contestId), 'leaderboard'] as const,
  session: (contestId: string) => [...contestKeys.detail(contestId), 'session'] as const,
};

type Options<T> = Omit<UseQueryOptions<T, Error, T, ReturnType<typeof contestKeys.all>>, 'queryKey' | 'queryFn'>;

export const useContestsQuery = (options?: Options<Awaited<ReturnType<typeof fetchContests>>>) =>
  useQuery({
    queryKey: contestKeys.all,
    queryFn: fetchContests,
    staleTime: 60_000,
    ...options,
  });

export const useContestQuery = (contestId: string, enabled = true) =>
  useQuery({
    queryKey: contestKeys.detail(contestId),
    queryFn: () => fetchContest(contestId),
    enabled,
  });

export const useLeaderboardQuery = (contestId: string, enabled = true) =>
  useQuery<LeaderboardPayload>({
    queryKey: contestKeys.leaderboard(contestId),
    queryFn: () => fetchLeaderboard(contestId),
    enabled,
    refetchInterval: 5_000,
  });

export const useStartSessionMutation = () =>
  useMutation<StartSessionRes, Error, string>({
    mutationFn: (contestId: string) => startContestSession(contestId),
  });

export const useFinishSessionMutation = () =>
  useMutation<SessionResult, Error, SessionResult>({
    mutationFn: (payload) => finishContestSession(payload),
  });
