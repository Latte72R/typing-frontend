import { apiClient } from '@/lib/apiClient.ts';
import type {
  Contest,
  CreateContestPayload,
  CreatePromptPayload,
  Prompt,
} from '@/types/api.ts';

export const createContest = async (payload: CreateContestPayload): Promise<Contest> => {
  return apiClient.post<Contest>('/contests', payload);
};

export const createPrompt = async (payload: CreatePromptPayload): Promise<Prompt> => {
  return apiClient.post<Prompt>('/prompts', payload);
};
