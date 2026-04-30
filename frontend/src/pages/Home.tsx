import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const tags = ['React', 'TypeScript', 'Python', 'Go', 'Rust', 'DevOps', 'Data', 'AI/ML', 'Backend', 'Mobile']

const stats = [
  { value: '12 000+', label: 'Offres actives' },
  { value: '3 400',   label: 'Entreprises' },
  { value: '94 %',    label: 'Taux de match' },
]

export default function Home() {
  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100svh' }}>
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-14 overflow-hidden">
        {/* Grid */}
        <div className="bg-grid absolute inset-0 opacity-[0.35]" />

        {/* Radial glow */}
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: 700, height: 700,
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(200,255,62,0.07) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div
            className="anim-fade-up inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-10 text-xs font-mono"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--text-2)',
              animationDelay: '0.05s',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
            WeLoveDevs · Données en temps réel
          </div>

          {/* Heading */}
          <h1
            className="anim-fade-up font-display font-extrabold leading-[0.9] tracking-tight"
            style={{
              fontSize: 'clamp(3.5rem, 10vw, 9rem)',
              color: 'var(--text)',
              animationDelay: '0.15s',
            }}
          >
            TROUVE TON
            <br />
            <span style={{ color: 'var(--accent)' }}>PROCHAIN JOB</span>
          </h1>

          {/* Subtitle */}
          <p
            className="anim-fade-up mt-7 text-lg max-w-xl mx-auto leading-relaxed"
            style={{ color: 'var(--text-2)', animationDelay: '0.28s' }}
          >
            Jobryx agrège les offres tech et stages depuis les meilleures sources —
            normalisées, triées et scorées pour les développeurs.
          </p>

          {/* CTAs */}
          <div
            className="anim-fade-up mt-10 flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: '0.4s' }}
          >
            <Link
              to="/register"
              className="px-6 py-3 text-sm font-display font-bold rounded-lg transition-all hover:opacity-90 hover:scale-[1.02]"
              style={{ background: 'var(--accent)', color: 'var(--accent-fg)', letterSpacing: '0.03em' }}
            >
              Commencer — c'est gratuit
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 text-sm rounded-lg transition-all"
              style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}
            >
              Se connecter
            </Link>
          </div>

          {/* Stats */}
          <div
            className="anim-fade-up mt-20 flex flex-wrap items-start justify-center gap-16"
            style={{ animationDelay: '0.55s' }}
          >
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <div
                  className="font-display font-extrabold text-4xl"
                  style={{ color: 'var(--text)' }}
                >
                  {s.value}
                </div>
                <div
                  className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em]"
                  style={{ color: 'var(--text-3)' }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div
            className="anim-fade-up mt-16 flex flex-wrap items-center justify-center gap-2"
            style={{ animationDelay: '0.68s' }}
          >
            {tags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full font-mono text-xs"
                style={{ border: '1px solid var(--border)', color: 'var(--text-3)' }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
          style={{ background: 'linear-gradient(to top, var(--bg), transparent)' }}
        />
      </section>
    </div>
  )
}
