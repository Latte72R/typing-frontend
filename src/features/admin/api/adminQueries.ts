import { useMutation } from '@tanstack/react-query';
import { createContest, createPrompt } from './adminService.ts';
import type {
  Contest,
  CreateContestPayload,
  CreatePromptPayload,
  Prompt,
} from '@/types/api.ts';

export const useCreateContestMutation = () =>
  useMutation<Contest, Error, CreateContestPayload>({
    mutationFn: createContest,
  });

export const useCreatePromptMutation = () =>
  useMutation<Prompt, Error, CreatePromptPayload>({
    mutationFn: createPrompt,
  });
