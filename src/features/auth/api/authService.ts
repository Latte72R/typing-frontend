import { apiClient } from '@/lib/apiClient.ts';
import {
  AuthResponse,
  PasswordResetPayload,
  SignInPayload,
  SignUpPayload,
} from '@/types/api.ts';

export const signIn = async (payload: SignInPayload): Promise<AuthResponse> => {
  return apiClient.post<AuthResponse>('/auth/signin', payload);
};

export const signUp = async (payload: SignUpPayload): Promise<AuthResponse> => {
  return apiClient.post<AuthResponse>('/auth/signup', payload);
};

export const signOut = async (): Promise<void> => {
  return apiClient.post<void>('/auth/signout');
};

export const requestPasswordReset = async (payload: PasswordResetPayload): Promise<void> => {
  return apiClient.post<void>('/auth/password-reset', payload);
};
