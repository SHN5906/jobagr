export interface User {
  id: string
  email: string
  username: string
  role: 'USER' | 'ADMIN'
  is_active: boolean
  created_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  username: string
  password: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}
