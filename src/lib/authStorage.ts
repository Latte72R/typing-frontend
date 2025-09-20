import type { AuthUser } from '@/types/api.ts';

export const AUTH_USER_STORAGE_KEY = 'typingArenaAuthUser';

const AUTH_USER_KEY = AUTH_USER_STORAGE_KEY;

export const storeAuthUser = (user: AuthUser) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

export const loadAuthUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch (error) {
    console.warn('認証ユーザー情報の読み込みに失敗しました', error);
    window.localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
};

export const clearAuthUser = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_USER_KEY);
};
