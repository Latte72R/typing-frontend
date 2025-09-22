import { ApiError, apiClient } from '@/lib/apiClient.ts';
import type {
  Contest,
  CreateContestPayload,
  CreatePromptPayload,
  Prompt,
} from '@/types/api.ts';

type ContestResponse = { contest: Contest };
type PromptResponse = { prompt: Prompt };
type PromptListResponse = { prompts: Prompt[] };

const unwrapContest = (value: Contest | ContestResponse): Contest => {
  if (typeof value === 'object' && value && 'contest' in value) {
    return (value as ContestResponse).contest;
  }
  if (typeof value === 'object' && value) {
    return value as Contest;
  }
  throw new ApiError(500, 'コンテストレスポンスの形式が不正です', value);
};

const unwrapPrompt = (value: Prompt | PromptResponse): Prompt => {
  if (typeof value === 'object' && value && 'prompt' in value) {
    return (value as PromptResponse).prompt;
  }
  if (typeof value === 'object' && value) {
    return value as Prompt;
  }
  throw new ApiError(500, 'プロンプトレスポンスの形式が不正です', value);
};

export const createContest = async (payload: CreateContestPayload): Promise<Contest> => {
  const response = await apiClient.post<Contest | ContestResponse>('/contests', payload);
  return unwrapContest(response);
};

export const createPrompt = async (payload: CreatePromptPayload): Promise<Prompt> => {
  const response = await apiClient.post<Prompt | PromptResponse>('/prompts', payload);
  return unwrapPrompt(response);
};

export const fetchPrompts = async (params: { language?: string; active?: boolean } = {}): Promise<Prompt[]> => {
  const searchParams = new URLSearchParams();
  if (params.language) {
    searchParams.set('language', params.language);
  }
  if (typeof params.active === 'boolean') {
    searchParams.set('active', String(params.active));
  }
  const suffix = searchParams.toString() ? `?${searchParams}` : '';
  const response = await apiClient.get<PromptListResponse>(`/prompts${suffix}`);
  if (!response || !Array.isArray(response.prompts)) {
    throw new ApiError(500, 'プロンプト一覧のレスポンス形式が不正です', response);
  }
  return response.prompts;
};

export const deleteContest = async (contestId: string): Promise<void> => {
  await apiClient.delete<void>(`/contests/${contestId}`);
};

export const deletePrompt = async (promptId: string): Promise<void> => {
  await apiClient.delete<void>(`/prompts/${promptId}`);
};
