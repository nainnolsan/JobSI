/* Lightweight HTTP client for browser-side calls.
 * - Uses NEXT_PUBLIC_API_BASE_URL when provided, else relative paths.
 * - Adds Authorization Bearer token from localStorage/cookie if available.
 * - Safe on SSR: only reads storage in browser.
 */

export type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

function getBaseUrl() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  return base && base.trim().length > 0 ? base : '';
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const fromStorage = window.localStorage.getItem('token');
    if (fromStorage) return fromStorage;
  } catch {}
  try {
    const m = document.cookie.match(/(?:^|; )token=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  } catch {}
  return null;
}

export type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  auth?: boolean; // include Bearer token if present
  signal?: AbortSignal;
};

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', headers = {}, body, auth = true, signal } = options;
  const url = `${getBaseUrl()}${path}`;

  const h: Record<string, string> = { 'Content-Type': 'application/json', ...headers };

  if (auth) {
    const token = getToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers: h,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
    // We use Authorization header; avoid cookies to simplify CORS
    credentials: 'omit',
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : await res.text();

  if (!res.ok) {
    const err: ApiError = {
      status: res.status,
      message: (data && (data.message || data.error)) || res.statusText,
      details: data,
    };
    throw err;
  }

  return data as T;
}

export const http = {
  get: <T>(path: string, opts: Omit<ApiOptions, 'method' | 'body'> = {}) => apiFetch<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body?: unknown, opts: Omit<ApiOptions, 'method' | 'body'> = {}) => apiFetch<T>(path, { ...opts, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, opts: Omit<ApiOptions, 'method' | 'body'> = {}) => apiFetch<T>(path, { ...opts, method: 'PUT', body }),
  del: <T>(path: string, opts: Omit<ApiOptions, 'method' | 'body'> = {}) => apiFetch<T>(path, { ...opts, method: 'DELETE' }),
};
