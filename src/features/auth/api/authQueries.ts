import { useMutation } from '@tanstack/react-query';
import {
  requestPasswordReset,
  signIn,
  signOut,
  signUp,
} from './authService.ts';
import type {
  AuthResponse,
  PasswordResetPayload,
  SignInPayload,
  SignUpPayload,
} from '@/types/api.ts';

export const useSignInMutation = () =>
  useMutation<AuthResponse, Error, SignInPayload>({
    mutationFn: signIn,
  });

export const useSignUpMutation = () =>
  useMutation<AuthResponse, Error, SignUpPayload>({
    mutationFn: signUp,
  });

export const useSignOutMutation = () =>
  useMutation<void, Error, void>({
    mutationFn: signOut,
  });

export const usePasswordResetMutation = () =>
  useMutation<void, Error, PasswordResetPayload>({
    mutationFn: requestPasswordReset,
  });
