import type { AuthResponse } from '@/types/api.ts';
import { clearAuthUser, storeAuthUser } from './authStorage.ts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

if (!API_BASE_URL) {
  console.warn('VITE_API_BASE_URL が設定されていません。APIリクエストは失敗します。');
}

const ACCESS_TOKEN_KEY = 'typingArenaAccessToken';
const REFRESH_TOKEN_KEY = 'typingArenaRefreshToken';

type RequestConfig = Omit<RequestInit, 'body'> & {
  body?: unknown;
  /**
   * リトライ時の無限ループを防ぐためのフラグ。true の場合はリフレッシュ処理を実行しない。
   */
  skipAuthRefresh?: boolean;
};

let refreshPromise: Promise<boolean> | null = null;

async function runRefreshRequest(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false;
  }
  const token = getRefreshToken();
  if (!token) {
    return false;
  }
  try {
    const response = await fetch(resolveBaseUrl('/auth/refresh'), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: token }),
      credentials: 'include',
    });

    if (!response.ok) {
      return false;
    }

    const payload = await response.json() as AuthResponse;

    setAccessToken(payload.accessToken);
    setRefreshToken(payload.refreshToken);
    storeAuthUser(payload.user);
    return true;
  } catch {
    return false;
  }
}

const refreshTokens = async (): Promise<boolean> => {
  if (!refreshPromise) {
    refreshPromise = runRefreshRequest().finally(() => {
      refreshPromise = null;
    });
  }
  const success = await refreshPromise;
  if (!success) {
    clearAccessToken();
    clearRefreshToken();
    clearAuthUser();
  }
  return success;
};

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const resolveBaseUrl = (path: string) => {
  if (!API_BASE_URL) return path;
  return `${API_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};

const buildHeaders = (headers?: HeadersInit): HeadersInit => {
  const token = getAccessToken();
  const baseHeaders: Record<string, string> = {
    Accept: 'application/json',
  };
  if (token) {
    baseHeaders.Authorization = `Bearer ${token}`;
  }

  return {
    ...baseHeaders,
    ...headers,
  };
};

const prepareBody = (body: unknown, headers: HeadersInit | undefined) => {
  if (body == null) {
    return { body: undefined, headers };
  }
  if (typeof body === 'string' || body instanceof FormData || body instanceof Blob) {
    return { body, headers };
  }
  const mergedHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };
  return { body: JSON.stringify(body), headers: mergedHeaders };
};

const request = async <T>(path: string, config: RequestConfig = {}) => {
  const { method = 'GET', headers, body, skipAuthRefresh, ...rest } = config;
  const url = resolveBaseUrl(path);
  const finalHeaders = buildHeaders(headers);
  const { body: preparedBody, headers: preparedHeaders } = prepareBody(body, finalHeaders);

  const response = await fetch(url, {
    method,
    headers: preparedHeaders,
    body: preparedBody,
    credentials: 'include',
    ...rest,
  });

  if (response.status === 401 && !skipAuthRefresh) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      return request<T>(path, { ...config, skipAuthRefresh: true });
    }
  }

  if (!response.ok) {
    let errorPayload: unknown;
    try {
      errorPayload = await response.json();
    } catch (error) {
      errorPayload = undefined;
    }
    const message = typeof errorPayload === 'object' && errorPayload && 'message' in errorPayload
      ? String((errorPayload as { message: unknown }).message)
      : `APIリクエストが失敗しました (status: ${response.status})`;
    throw new ApiError(response.status, message, errorPayload);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return (await response.json()) as T;
  }
  return (await response.text()) as T;
};

export const apiClient = {
  request,
  get: <T>(path: string, config?: RequestConfig) => request<T>(path, { ...config, method: 'GET' }),
  post: <T>(path: string, body?: unknown, config?: RequestConfig) =>
    request<T>(path, { ...config, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, config?: RequestConfig) =>
    request<T>(path, { ...config, method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown, config?: RequestConfig) =>
    request<T>(path, { ...config, method: 'PUT', body }),
  delete: <T>(path: string, config?: RequestConfig) => request<T>(path, { ...config, method: 'DELETE' }),
};

export const getAccessToken = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const setAccessToken = (token: string) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const clearAccessToken = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setRefreshToken = (token: string) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const clearRefreshToken = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
};
