import type { LoginCredentials, RegisterCredentials, TokenResponse, User } from '../types/auth'

const BASE = '/api/v1'

export interface Offer {
  id: string
  title: string
  company: string
  location: string
  work_mode: string
  contract: 'CDI' | 'STAGE' | 'ALTERNANCE' | 'FREELANCE'
  salary: string | null
  tags: string[]
  score: number
  is_active: boolean
  source: string | null
  posted_at: string
  created_at: string
}

export interface JobsResponse {
  jobs: Offer[]
  total: number
  page: number
  limit: number
}

function authHeader(): Record<string, string> {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

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
    request<{ user: User }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: LoginCredentials) =>
    request<TokenResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  getMe: async (token: string): Promise<User> => {
    const data = await request<{ user: User }>('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
    return data.user
  },

  getJobs: (params?: { contract?: string; q?: string; page?: number }) => {
    const qs = new URLSearchParams()
    if (params?.contract && params.contract !== 'Tous') qs.set('contract', params.contract)
    if (params?.q) qs.set('q', params.q)
    if (params?.page) qs.set('page', String(params.page))
    const query = qs.toString() ? `?${qs}` : ''
    return request<JobsResponse>(`/jobs${query}`, { headers: authHeader() })
  },
}
