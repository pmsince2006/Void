// Base API configuration layer for VOID backend services

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = new Headers({
    'Content-Type': 'application/json',
    ...(options.headers || {})
  });

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      let errorBody = null;
      try {
        errorBody = await res.json();
      } catch {
        errorBody = await res.text();
      }
      throw new ApiError(res.statusText || 'Request failed', res.status, errorBody);
    }
    return (await res.json()) as T;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(err?.message || 'Network error connecting to VOID backend', 0, null);
  }
}
