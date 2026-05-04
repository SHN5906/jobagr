import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { apiClient } from '../services/api'
import type { LoginCredentials, RegisterCredentials, User } from '../types/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const DEMO_USER: User | null = import.meta.env.DEV
    ? { id: 'demo', email: 'sohan@jobryx.dev', username: 'Sohan', role: 'user', is_active: true, created_at: new Date().toISOString() }
    : null

  const [user, setUser] = useState<User | null>(DEMO_USER)
  const [loading, setLoading] = useState(!import.meta.env.DEV)

  useEffect(() => {
    if (import.meta.env.DEV) return
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }
    apiClient.getMe(token)
      .then(setUser)
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [])

  const login = async (credentials: LoginCredentials) => {
    const { access_token } = await apiClient.login(credentials)
    localStorage.setItem('token', access_token)
    const me = await apiClient.getMe(access_token)
    setUser(me)
  }

  const register = async (credentials: RegisterCredentials) => {
    await apiClient.register(credentials)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
