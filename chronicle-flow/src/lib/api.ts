/**
 * Utility functions for making authenticated API calls
 */

// Use Vite environment variable when available (typed via `src/vite-env.d.ts`), default to Render backend
const VITE_API_URL = import.meta.env.VITE_API_URL;

// Normalize base url to ensure there's no trailing slash before adding `/api`
function normalizeBaseUrl(base?: string) {
  // Default to the known Render backend for this repository
  if (!base) return 'https://blog-backend-e4j1.onrender.com';
  return base.replace(/\/$/, '');
}
export const API_BASE_URL = `${normalizeBaseUrl(VITE_API_URL)}/api`;

// Manage auth token (if your backend uses JWTs in Authorization headers)
export function setAuthToken(token?: string | null) {
  if (token) {
    try { localStorage.setItem('authToken', token); } catch (e) { /* ignore */ }
  } else {
    try { localStorage.removeItem('authToken'); } catch (e) { /* ignore */ }
  }
}

export function getAuthToken(): string | null {
  try { return localStorage.getItem('authToken'); } catch (e) { return null; }
}

export interface FetchOptions extends RequestInit {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
}

/**
 * Make an authenticated API call with credentials included
 */
export async function apiCall(endpoint: string, options: FetchOptions = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const token = getAuthToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && !(options.headers && (options.headers as any)['Authorization']) ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    credentials: 'include', // Always include credentials for cookie-based auth
  });

  return response;
}

/**
 * Make an authenticated API call and parse JSON response
 */
export async function apiCallJson(endpoint: string, options: FetchOptions = {}) {
  const response = await apiCall(endpoint, options);
  return response.json();
}

/**
 * GET request
 */
export async function get(endpoint: string) {
  return apiCall(endpoint, { method: 'GET' });
}

/**
 * GET request and parse JSON
 */
export async function getJson(endpoint: string) {
  return apiCallJson(endpoint, { method: 'GET' });
}

/**
 * POST request
 */
export async function post(endpoint: string, data?: Record<string, any>) {
  return apiCall(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * POST request and parse JSON
 */
export async function postJson(endpoint: string, data?: Record<string, any>) {
  return apiCallJson(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT request
 */
export async function put(endpoint: string, data?: Record<string, any>) {
  return apiCall(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT request and parse JSON
 */
export async function putJson(endpoint: string, data?: Record<string, any>) {
  return apiCallJson(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE request
 */
export async function deleteRequest(endpoint: string) {
  return apiCall(endpoint, { method: 'DELETE' });
}

/**
 * DELETE request and parse JSON
 */
export async function deleteJson(endpoint: string) {
  return apiCallJson(endpoint, { method: 'DELETE' });
}
