const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

if (!API_BASE_URL) {
  console.warn('VITE_API_BASE_URL が設定されていません。APIリクエストは失敗します。');
}

const ACCESS_TOKEN_KEY = 'typingArenaAccessToken';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

type RequestConfig = Omit<RequestInit, 'body'> & {
  body?: unknown;
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

const request = async <T>(path: string, { method = 'GET', headers, body, ...rest }: RequestConfig = {}) => {
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
