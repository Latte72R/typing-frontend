import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchContest,
  fetchContestPrompts,
  fetchContests,
  fetchLeaderboard,
  finishContestSession,
  joinContest,
  requestNextPrompt,
  startContestSession,
  updateContestPrompts,
} from './contestService.ts';
import type {
  ContestPromptAssignment,
  FinishSessionReq,
  LeaderboardPayload,
  NextPromptRes,
  SessionResult,
  StartSessionRes,
} from '@/types/api.ts';
import type { UpdateContestPromptsPayload } from './contestService.ts';

const contestKeys = {
  all: ['contests'] as const,
  detail: (contestId: string) => [...contestKeys.all, contestId] as const,
  leaderboard: (contestId: string) => [...contestKeys.detail(contestId), 'leaderboard'] as const,
  prompts: (contestId: string) => [...contestKeys.detail(contestId), 'prompts'] as const,
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

export const useContestPromptsQuery = (contestId: string, enabled = true) =>
  useQuery<ContestPromptAssignment[]>({
    queryKey: contestKeys.prompts(contestId),
    queryFn: () => fetchContestPrompts(contestId),
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

export const useNextPromptMutation = () =>
  useMutation<NextPromptRes, Error, string>({
    mutationFn: (sessionId: string) => requestNextPrompt(sessionId),
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

export const useUpdateContestPromptsMutation = (contestId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, UpdateContestPromptsPayload>({
    mutationFn: (payload) => updateContestPrompts(contestId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contestKeys.prompts(contestId) });
    },
  });
};
