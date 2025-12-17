/**
 * Utility functions for making authenticated API calls
 */

const API_BASE_URL = 'http://localhost:5000/api';

export interface FetchOptions extends RequestInit {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
}

/**
 * Make an authenticated API call with credentials included
 */
export async function apiCall(endpoint: string, options: FetchOptions = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
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
