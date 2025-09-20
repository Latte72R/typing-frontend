import { apiClient } from '@/lib/apiClient.ts';
import type {
  Contest,
  FinishSessionReq,
  LeaderboardPayload,
  SessionResult,
  StartSessionRes,
} from '@/types/api.ts';

type JoinContestPayload = {
  joinCode?: string;
};

type FinishSessionPayload = {
  sessionId: string;
  request: FinishSessionReq;
};

export const fetchContests = async (): Promise<Contest[]> => {
  return apiClient.get<Contest[]>('/contests');
};

export const fetchContest = async (contestId: string): Promise<Contest> => {
  return apiClient.get<Contest>(`/contests/${contestId}`);
};

export const fetchLeaderboard = async (contestId: string): Promise<LeaderboardPayload> => {
  return apiClient.get<LeaderboardPayload>(`/contests/${contestId}/leaderboard`);
};

export const joinContest = async (contestId: string, payload: JoinContestPayload = {}) => {
  const body = payload.joinCode ? payload : undefined;
  return apiClient.post<void>(`/contests/${contestId}/join`, body);
};

export const startContestSession = async (contestId: string): Promise<StartSessionRes> => {
  return apiClient.post<StartSessionRes>(`/contests/${contestId}/sessions`);
};

export const finishContestSession = async ({
  sessionId,
  request,
}: FinishSessionPayload): Promise<SessionResult> => {
  return apiClient.post<SessionResult>(`/sessions/${sessionId}/finish`, request);
};
