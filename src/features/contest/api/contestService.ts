import { ApiError, apiClient } from '@/lib/apiClient.ts';
import type {
  Contest,
  ContestPromptAssignment,
  FinishSessionReq,
  LeaderboardPayload,
  NextPromptRes,
  SessionResult,
  StartSessionRes,
} from '@/types/api.ts';

type JoinContestPayload = {
  joinCode?: string;
};

type FinishSessionPayload = {
  sessionId: string;
  contestId: string;
  request: FinishSessionReq;
};

type FinishSessionResponse = {
  status: 'finished' | 'expired' | 'dq';
  stats: {
    cpm: number;
    wpm: number;
    accuracy: number;
    score: number;
    correct: number;
    mistakes: number;
    elapsedMs: number;
  };
  issues: string[];
  anomaly: {
    mean: number;
    stdev: number;
    cv: number;
    count: number;
  };
  flags: {
    pasteBlocked: boolean;
    defocus: number;
    anomalyScore?: number;
  };
  bestUpdated: boolean;
  attemptsUsed: number;
};

type ContestListResponse = { contests: Contest[] };
type ContestDetailResponse = { contest: Contest };
type ContestPromptsResponse = { prompts: ContestPromptAssignment[] };

const isContestListResponse = (value: unknown): value is ContestListResponse => {
  if (typeof value !== 'object' || value === null) return false;
  const contests = (value as { contests?: unknown }).contests;
  return Array.isArray(contests);
};

const isContestDetailResponse = (value: unknown): value is ContestDetailResponse => {
  if (typeof value !== 'object' || value === null) return false;
  return 'contest' in value && typeof (value as { contest?: unknown }).contest === 'object';
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
  const response = await apiClient.get<Contest | ContestDetailResponse>(`/contests/${contestId}`);
  if (isContestDetailResponse(response)) {
    return response.contest;
  }
  if (typeof response === 'object' && response !== null) {
    return response as Contest;
  }
  throw new ApiError(500, 'コンテスト詳細のレスポンス形式が不正です', response);
};

export const fetchContestPrompts = async (contestId: string): Promise<ContestPromptAssignment[]> => {
  const response = await apiClient.get<ContestPromptsResponse>(`/contests/${contestId}/prompts`);
  if (!response || !Array.isArray(response.prompts)) {
    throw new ApiError(500, 'コンテストプロンプトのレスポンス形式が不正です', response);
  }
  return response.prompts;
};

export type UpdateContestPromptsPayload = {
  prompts: Array<{ promptId: string; orderIndex?: number }>;
};

export const updateContestPrompts = async (
  contestId: string,
  payload: UpdateContestPromptsPayload,
): Promise<void> => {
  await apiClient.post<void>(`/contests/${contestId}/prompts`, payload);
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
  contestId,
  request,
}: FinishSessionPayload): Promise<SessionResult> => {
  const response = await apiClient.post<FinishSessionResponse>(`/sessions/${sessionId}/finish`, request);
  if (!response || typeof response !== 'object' || !response.stats) {
    return {
      sessionId,
      contestId,
      ...request,
      completedAt: new Date().toISOString(),
    } satisfies SessionResult;
  }
  const stats = response.stats;
  const flags = response.flags ?? {};
  return {
    sessionId,
    contestId,
    cpm: stats.cpm,
    wpm: stats.wpm,
    accuracy: stats.accuracy,
    score: stats.score,
    errors: typeof stats.mistakes === 'number' ? stats.mistakes : request.errors,
    keylog: request.keylog,
    clientFlags: {
      defocus: flags.defocus ?? request.clientFlags?.defocus ?? 0,
      pasteBlocked: flags.pasteBlocked ?? request.clientFlags?.pasteBlocked ?? false,
      anomalyScore: flags.anomalyScore ?? request.clientFlags?.anomalyScore,
    },
    completedAt: new Date().toISOString(),
  } satisfies SessionResult;
};

export const requestNextPrompt = async (sessionId: string): Promise<NextPromptRes> => {
  return apiClient.post<NextPromptRes>(`/sessions/${sessionId}/prompts/next`);
};
