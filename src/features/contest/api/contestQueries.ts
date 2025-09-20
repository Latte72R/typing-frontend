import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchContest,
  fetchContests,
  fetchLeaderboard,
  finishContestSession,
  joinContest,
  startContestSession,
} from './contestService.ts';
import { FinishSessionReq, LeaderboardPayload, SessionResult, StartSessionRes } from '@/types/api.ts';

const contestKeys = {
  all: ['contests'] as const,
  detail: (contestId: string) => [...contestKeys.all, contestId] as const,
  leaderboard: (contestId: string) => [...contestKeys.detail(contestId), 'leaderboard'] as const,
  session: (contestId: string) => [...contestKeys.detail(contestId), 'session'] as const,
};

type FinishSessionVariables = {
  sessionId: string;
  contestId: string;
  request: FinishSessionReq;
};

type JoinContestVariables = {
  contestId: string;
  joinCode?: string;
};

export const useContestsQuery = () =>
  useQuery({
    queryKey: contestKeys.all,
    queryFn: fetchContests,
    staleTime: 60_000,
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

export const useFinishSessionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<SessionResult, Error, FinishSessionVariables>({
    mutationFn: ({ sessionId, request }) => finishContestSession({ sessionId, request }),
    onSuccess: (data, variables) => {
      const targetContestId = data?.contestId ?? variables.contestId;
      queryClient.invalidateQueries({ queryKey: contestKeys.leaderboard(targetContestId) });
    },
  });
};

export const useJoinContestMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, JoinContestVariables>({
    mutationFn: ({ contestId, joinCode }) => joinContest(contestId, { joinCode }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: contestKeys.detail(variables.contestId) });
    },
  });
};
