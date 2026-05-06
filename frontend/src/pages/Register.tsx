import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ApiError } from '../services/api'

const PWD_RULES = [
  { label: 'Au moins 8 caractères',      test: (p: string) => p.length >= 8 },
  { label: 'Une lettre majuscule',        test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Une lettre minuscule',        test: (p: string) => /[a-z]/.test(p) },
  { label: 'Un chiffre',                  test: (p: string) => /[0-9]/.test(p) },
  { label: 'Un caractère spécial',        test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail]       = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [pwdFocused, setPwdFocused] = useState(false)

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [globalError, setGlobalError] = useState('')
  const [loading, setLoading]   = useState(false)

  const pwdChecks = PWD_RULES.map(r => ({ label: r.label, ok: r.test(password) }))
  const showPwdChecklist = pwdFocused || password.length > 0

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFieldErrors({})
    setGlobalError('')
    setLoading(true)
    try {
      await register({ email, username, password })
      navigate('/login')
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors.length > 0) {
        const map: Record<string, string[]> = {}
        for (const fe of err.fieldErrors) {
          if (!map[fe.field]) map[fe.field] = []
          map[fe.field].push(fe.message)
        }
        setFieldErrors(map)
      } else {
        setGlobalError(err instanceof Error ? err.message : "Échec de l'inscription")
      }
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
            top: -80, right: -80,
            background: 'radial-gradient(circle, rgba(200,255,62,0.07) 0%, transparent 65%)',
          }}
        />

        <div className="relative z-10">
          <Link
            to="/"
            className="font-display font-extrabold text-base tracking-widest"
            style={{ color: 'var(--accent)', letterSpacing: '0.12em' }}
          >
            JOBRYX
          </Link>

          <div
            className="mt-6 inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em]"
            style={{
              background: 'rgba(200,255,62,0.08)',
              border: '1px solid rgba(200,255,62,0.25)',
              color: 'var(--accent)',
            }}
          >
            <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
            Beta · v0.1
          </div>

          <div
            className="mt-8 rounded-lg p-4 font-mono text-xs"
            style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-1.5 mb-3">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FEBC2E' }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
              <span className="ml-2 text-[10px]" style={{ color: 'var(--text-3)' }}>~/jobryx</span>
            </div>
            <div style={{ color: 'var(--text-3)' }}>
              <span style={{ color: 'var(--accent)' }}>$</span> jobryx --signup
              <br />
              <span style={{ color: 'var(--text-2)' }}>→ creating account...</span>
              <br />
              <span style={{ color: 'var(--accent)' }}>✓</span>{' '}
              <span style={{ color: 'var(--text-2)' }}>welcome aboard</span>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p
            className="font-display font-bold leading-tight"
            style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', color: 'var(--text)' }}
          >
            Trente secondes,<br />
            <span style={{ color: 'var(--accent)' }}>c'est bon.</span>
          </p>
          <p className="mt-5 text-sm" style={{ color: 'var(--text-3)' }}>
            Email, pseudo, mot de passe. On bouge pas plus loin.
          </p>

          <ul className="mt-8 flex flex-col gap-3">
            {[
              'Accès aux 12 000+ offres tech',
              'Score de pertinence personnalisé',
              'Filtres avancés & favoris',
              'Aucune pub, aucun spam',
            ].map(b => (
              <li key={b} className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-2)' }}>
                <span
                  className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center font-bold text-[10px]"
                  style={{ background: 'rgba(200,255,62,0.12)', color: 'var(--accent)' }}
                >
                  ✓
                </span>
                {b}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: 'var(--text-3)' }}>
              Étape 1/3
            </span>
            <div className="flex-1 flex gap-1">
              <span className="flex-1 h-0.5 rounded-full" style={{ background: 'var(--accent)' }} />
              <span className="flex-1 h-0.5 rounded-full" style={{ background: 'var(--border-2)' }} />
              <span className="flex-1 h-0.5 rounded-full" style={{ background: 'var(--border-2)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel — form ────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm anim-fade-up">

          <Link
            to="/"
            className="lg:hidden block mb-10 font-display font-extrabold text-base tracking-widest"
            style={{ color: 'var(--accent)', letterSpacing: '0.12em' }}
          >
            JOBRYX
          </Link>

          <h2 className="font-display font-bold text-2xl" style={{ color: 'var(--text)' }}>
            On y va.
          </h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-2)' }}>
            Crée ton compte en 30 secondes.
          </p>

          {/* Global error (conflict, serveur, etc.) */}
          {globalError && (
            <div
              className="mt-6 text-sm rounded-lg px-4 py-3"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#F87171',
              }}
            >
              {globalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">

            {/* Email */}
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
                  border: `1px solid ${fieldErrors['email'] ? 'rgba(239,68,68,0.6)' : 'var(--border)'}`,
                  color: 'var(--text)',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = fieldErrors['email'] ? 'rgba(239,68,68,0.8)' : 'var(--accent)')}
                onBlur={e  => (e.currentTarget.style.borderColor = fieldErrors['email'] ? 'rgba(239,68,68,0.6)' : 'var(--border)')}
              />
              {fieldErrors['email']?.map((msg, i) => (
                <p key={i} className="mt-1.5 text-xs" style={{ color: '#F87171' }}>{msg}</p>
              ))}
            </div>

            {/* Username */}
            <div>
              <label
                className="block font-mono text-[10px] uppercase tracking-[0.15em] mb-2"
                style={{ color: 'var(--text-3)' }}
              >
                Nom d'utilisateur
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                placeholder="sohan"
                className="w-full rounded-lg px-4 py-3 text-sm transition-colors"
                style={{
                  background: 'var(--bg-surface)',
                  border: `1px solid ${fieldErrors['username'] ? 'rgba(239,68,68,0.6)' : 'var(--border)'}`,
                  color: 'var(--text)',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = fieldErrors['username'] ? 'rgba(239,68,68,0.8)' : 'var(--accent)')}
                onBlur={e  => (e.currentTarget.style.borderColor = fieldErrors['username'] ? 'rgba(239,68,68,0.6)' : 'var(--border)')}
              />
              {fieldErrors['username']?.map((msg, i) => (
                <p key={i} className="mt-1.5 text-xs" style={{ color: '#F87171' }}>{msg}</p>
              ))}
            </div>

            {/* Password */}
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
                  border: `1px solid ${fieldErrors['password'] ? 'rgba(239,68,68,0.6)' : 'var(--border)'}`,
                  color: 'var(--text)',
                }}
                onFocus={e => { setPwdFocused(true); e.currentTarget.style.borderColor = fieldErrors['password'] ? 'rgba(239,68,68,0.8)' : 'var(--accent)' }}
                onBlur={e  => { setPwdFocused(false); e.currentTarget.style.borderColor = fieldErrors['password'] ? 'rgba(239,68,68,0.6)' : 'var(--border)' }}
              />

              {/* Live password checklist */}
              {showPwdChecklist && (
                <ul className="mt-3 flex flex-col gap-1.5">
                  {pwdChecks.map(({ label, ok }) => (
                    <li key={label} className="flex items-center gap-2 text-xs transition-colors" style={{ color: ok ? '#4ade80' : 'var(--text-3)' }}>
                      <span
                        className="flex-shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold"
                        style={{
                          background: ok ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${ok ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.1)'}`,
                        }}
                      >
                        {ok ? '✓' : '·'}
                      </span>
                      {label}
                    </li>
                  ))}
                </ul>
              )}

              {/* Server-side password errors (si le checklist est masqué) */}
              {!showPwdChecklist && fieldErrors['password']?.map((msg, i) => (
                <p key={i} className="mt-1.5 text-xs" style={{ color: '#F87171' }}>{msg}</p>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full py-3 rounded-lg text-sm font-display font-bold tracking-wide transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
            >
              {loading ? 'Création…' : 'Créer mon compte'}
            </button>
          </form>

          <p className="mt-6 text-sm text-center" style={{ color: 'var(--text-3)' }}>
            Déjà inscrit ?{' '}
            <Link
              to="/login"
              className="transition-opacity hover:opacity-80"
              style={{ color: 'var(--accent)' }}
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
