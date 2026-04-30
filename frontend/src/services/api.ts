import type { LoginCredentials, RegisterCredentials, TokenResponse, User } from '../types/auth'

const BASE = '/api/v1'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail ?? 'Request failed')
  }
  return res.json()
}

export const apiClient = {
  register: (data: RegisterCredentials) =>
    request<User>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: LoginCredentials) =>
    request<TokenResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  getMe: (token: string) =>
    request<User>('/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
}
