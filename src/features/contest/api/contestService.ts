import { ApiError, apiClient } from '@/lib/apiClient.ts';
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

type ContestListResponse = { contests: Contest[] };

const isContestListResponse = (value: unknown): value is ContestListResponse => {
  if (typeof value !== 'object' || value === null) return false;
  const contests = (value as { contests?: unknown }).contests;
  return Array.isArray(contests);
};

export const fetchContests = async (): Promise<Contest[]> => {
  const response = await apiClient.get<Contest[] | ContestListResponse>('/contests');
  if (Array.isArray(response)) {
    return response;
  }
  if (isContestListResponse(response)) {
    return response.contests;
  }
  throw new ApiError(500, 'コンテスト一覧のレスポンス形式が不正です', response);
};

export const fetchContest = async (contestId: string): Promise<Contest> => {
  return apiClient.get<Contest>(`/contests/${contestId}`);
};

export const fetchLeaderboard = async (contestId: string): Promise<LeaderboardPayload> => {
  return apiClient.get<LeaderboardPayload>(`/contests/${contestId}/leaderboard`);
};

export const joinContest = async (contestId: string, payload: JoinContestPayload = {}) => {
  const body: JoinContestPayload = payload.joinCode ? payload : {};
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
