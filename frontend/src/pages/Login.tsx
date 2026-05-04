import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ email, password })
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de la connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>

      {/* ── Left panel — branding ─────────────────────────── */}
      <div
        className="hidden lg:flex w-[45%] relative overflow-hidden flex-col justify-between p-14"
        style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border)' }}
      >
        <div className="bg-grid absolute inset-0 opacity-25" />
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: 480, height: 480,
            bottom: -100, left: -100,
            background: 'radial-gradient(circle, rgba(200,255,62,0.08) 0%, transparent 65%)',
          }}
        />

        {/* Logo */}
        <Link
          to="/"
          className="relative z-10 font-display font-extrabold text-base tracking-widest"
          style={{ color: 'var(--accent)', letterSpacing: '0.12em' }}
        >
          JOBRYX
        </Link>

        {/* Quote */}
        <div className="relative z-10">
          <p
            className="font-display font-bold leading-tight"
            style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', color: 'var(--text)' }}
          >
            Reprends<br />
            où tu t'es<br />
            <span style={{ color: 'var(--accent)' }}>arrêté.</span>
          </p>
          <p className="mt-5 text-sm" style={{ color: 'var(--text-3)' }}>
            Tes recherches, tes filtres, tes favoris.
          </p>
        </div>
      </div>

      {/* ── Right panel — form ────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm anim-fade-up">

          {/* Mobile logo */}
          <Link
            to="/"
            className="lg:hidden block mb-10 font-display font-extrabold text-base tracking-widest"
            style={{ color: 'var(--accent)', letterSpacing: '0.12em' }}
          >
            JOBRYX
          </Link>

          <h2 className="font-display font-bold text-2xl" style={{ color: 'var(--text)' }}>
            Connexion
          </h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-2)' }}>
            On t'attendait.
          </p>

          {/* Error */}
          {error && (
            <div
              className="mt-6 text-sm rounded-lg px-4 py-3"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#F87171',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
            <div>
              <label
                className="block font-mono text-[10px] uppercase tracking-[0.15em] mb-2"
                style={{ color: 'var(--text-3)' }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="toi@example.com"
                className="w-full rounded-lg px-4 py-3 text-sm transition-colors"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onBlur={e  => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
            </div>

            <div>
              <label
                className="block font-mono text-[10px] uppercase tracking-[0.15em] mb-2"
                style={{ color: 'var(--text-3)' }}
              >
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-lg px-4 py-3 text-sm transition-colors"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onBlur={e  => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full py-3 rounded-lg text-sm font-display font-bold tracking-wide transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
            >
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <p className="mt-6 text-sm text-center" style={{ color: 'var(--text-3)' }}>
            Pas de compte ?{' '}
            <Link
              to="/register"
              className="transition-opacity hover:opacity-80"
              style={{ color: 'var(--accent)' }}
            >
              En créer un
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
