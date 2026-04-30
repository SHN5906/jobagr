import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const { pathname } = useLocation()

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-14"
      style={{ borderBottom: '1px solid var(--border)', background: 'rgba(9,9,11,0.8)', backdropFilter: 'blur(16px)' }}
    >
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Wordmark */}
        <Link
          to="/"
          className="font-display font-extrabold text-base tracking-widest transition-colors"
          style={{ color: pathname === '/' ? 'var(--accent)' : 'var(--text)', letterSpacing: '0.12em' }}
        >
          JOBRYX
        </Link>

        {/* Actions */}
        <nav className="flex items-center gap-1">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="px-3 py-1.5 text-sm rounded-md transition-colors"
                style={{
                  color: pathname === '/dashboard' ? 'var(--text)' : 'var(--text-2)',
                  background: pathname === '/dashboard' ? 'var(--bg-raised)' : 'transparent',
                }}
              >
                Dashboard
              </Link>
              <span
                className="mx-3 font-mono text-xs"
                style={{ color: 'var(--text-3)' }}
              >
                {user?.username}
              </span>
              <button
                onClick={logout}
                className="px-3 py-1.5 text-sm rounded-md transition-colors"
                style={{ color: 'var(--text-3)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3 py-1.5 text-sm rounded-md transition-colors"
                style={{ color: 'var(--text-2)' }}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 text-sm font-display font-bold rounded-md transition-opacity hover:opacity-90"
                style={{ background: 'var(--accent)', color: 'var(--accent-fg)', letterSpacing: '0.02em' }}
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
