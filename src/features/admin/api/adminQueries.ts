import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createContest, createPrompt, deleteContest, deletePrompt, fetchPrompts } from './adminService.ts';
import type {
  Contest,
  CreateContestPayload,
  CreatePromptPayload,
  Prompt,
} from '@/types/api.ts';

type PromptQueryParams = {
  language?: string;
  active?: boolean;
};

const DEFAULT_PROMPT_PARAMS: PromptQueryParams = { active: true };

export const useCreateContestMutation = () =>
  {
    const queryClient = useQueryClient();
    return useMutation<Contest, Error, CreateContestPayload>({
      mutationFn: createContest,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['contests'] });
      },
    });
  };

export const useCreatePromptMutation = () =>
  {
    const queryClient = useQueryClient();
    return useMutation<Prompt, Error, CreatePromptPayload>({
      mutationFn: createPrompt,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['prompts'] });
      },
    });
  };

export const usePromptsQuery = (params: PromptQueryParams = DEFAULT_PROMPT_PARAMS) => {
  const effectiveParams = params ?? DEFAULT_PROMPT_PARAMS;
  const queryKey = [
    'prompts',
    effectiveParams.language ?? 'all',
    effectiveParams.active ?? 'all',
  ] as const;
  return useQuery({
    queryKey,
    queryFn: () => fetchPrompts(effectiveParams),
    staleTime: 30_000,
  });
};

export const useDeleteContestMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteContest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contests'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
};

export const useDeletePromptMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deletePrompt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });
};
