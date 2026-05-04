import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../hooks/useAuth'

const metrics = [
  { label: 'Offres dans ton scope', value: '142',  trend: '+12',  trendLabel: 'cette semaine' },
  { label: 'Score moyen',            value: '78',   trend: '+5',   trendLabel: 'vs. précédent', suffix: '%' },
  { label: 'À voir aujourd\'hui',    value: '7',    trend: 'NEW',  trendLabel: 'curées pour toi' },
]

const filters = ['Tous', 'CDI', 'Stage', 'Alternance', 'Freelance']

const offers = [
  { title: 'Backend Python — équipe Data',     company: 'Datalys',      logo: 'D', location: 'Paris',     remote: 'Hybride', type: 'CDI',   salary: '50–65k €', tags: ['Python', 'FastAPI', 'PostgreSQL'], score: 94 },
  { title: 'Ingénieur DevOps Cloud',           company: 'OvhCloud',     logo: 'O', location: 'Lyon',      remote: 'Sur site', type: 'CDI',   salary: '55–70k €', tags: ['Docker', 'Kubernetes', 'Terraform'], score: 89 },
  { title: 'Stage Data Engineer (6 mois)',     company: 'Dataiku',      logo: 'D', location: 'Remote',    remote: 'Full remote', type: 'Stage', salary: '1 400 €', tags: ['Spark', 'dbt', 'Airflow'], score: 86 },
  { title: 'Frontend React Senior',            company: 'Doctolib',     logo: 'D', location: 'Levallois', remote: 'Hybride', type: 'CDI',   salary: '60–80k €', tags: ['React', 'TypeScript', 'Tailwind'], score: 82 },
  { title: 'Alternance ML Engineer',           company: 'Mistral AI',   logo: 'M', location: 'Paris',     remote: 'Hybride', type: 'Alternance', salary: '— ', tags: ['PyTorch', 'CUDA', 'Python'], score: 78 },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [active, setActive] = useState('Tous')
  const [search, setSearch] = useState('')

  const visible = offers.filter(o => active === 'Tous' || o.type === active)

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100svh' }}>
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pt-24 pb-12">

        {/* ── Header ──────────────────────────────────────── */}
        <div className="anim-fade-up">
          <span className="font-mono text-xs uppercase tracking-[0.15em]" style={{ color: 'var(--text-3)' }}>
            Salut,
          </span>
          <h1
            className="mt-1 font-display font-extrabold leading-tight"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: 'var(--text)' }}
          >
            {user?.username}
            <span style={{ color: 'var(--accent)' }}>.</span>
          </h1>
          <p className="mt-3 text-sm" style={{ color: 'var(--text-2)' }}>
            7 nouvelles offres correspondent à ton profil aujourd'hui.
          </p>
        </div>

        {/* ── Metrics ─────────────────────────────────────── */}
        <div
          className="anim-fade-up mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4"
          style={{ animationDelay: '0.1s' }}
        >
          {metrics.map(m => (
            <div
              key={m.label}
              className="rounded-xl p-6 transition-colors"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-2)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.15em] mb-3" style={{ color: 'var(--text-3)' }}>
                {m.label}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-extrabold text-4xl" style={{ color: 'var(--text)' }}>
                  {m.value}
                </span>
                {m.suffix && (
                  <span className="font-display font-bold text-xl" style={{ color: 'var(--text-2)' }}>
                    {m.suffix}
                  </span>
                )}
              </div>
              <div className="mt-3 inline-flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded-full font-mono text-[10px] font-medium"
                  style={{
                    background: 'rgba(200,255,62,0.1)',
                    color: 'var(--accent)',
                    border: '1px solid rgba(200,255,62,0.25)',
                  }}
                >
                  {m.trend}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-3)' }}>{m.trendLabel}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Search + Filters ────────────────────────────── */}
        <div
          className="anim-fade-up mt-12 flex flex-col gap-4"
          style={{ animationDelay: '0.18s' }}
        >
          <div className="relative">
            <span
              className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-xs"
              style={{ color: 'var(--text-3)' }}
            >
              ⌕
            </span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="React, Paris, alternance…"
              className="w-full rounded-xl pl-10 pr-4 py-3.5 text-sm transition-colors"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onBlur={e  => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: active === f ? 'var(--accent)' : 'transparent',
                  color: active === f ? 'var(--accent-fg)' : 'var(--text-2)',
                  border: `1px solid ${active === f ? 'var(--accent)' : 'var(--border)'}`,
                }}
              >
                {f}
              </button>
            ))}
            <span className="ml-auto font-mono text-xs" style={{ color: 'var(--text-3)' }}>
              {visible.length} offre{visible.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* ── Offer feed ──────────────────────────────────── */}
        <div className="anim-fade-up mt-6 flex flex-col gap-3" style={{ animationDelay: '0.28s' }}>
          {visible.map(offer => (
            <div
              key={offer.title}
              className="group flex items-stretch gap-5 rounded-xl px-6 py-5 transition-all cursor-pointer"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-2)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              {/* Logo */}
              <div
                className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-display font-bold text-lg"
                style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
              >
                {offer.logo}
              </div>

              {/* Body */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="font-display font-semibold text-sm" style={{ color: 'var(--text)' }}>
                    {offer.title}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full font-mono text-[10px] font-medium"
                    style={{
                      background: offer.type === 'Stage' || offer.type === 'Alternance' ? 'rgba(200,255,62,0.1)' : 'var(--bg-raised)',
                      color: offer.type === 'Stage' || offer.type === 'Alternance' ? 'var(--accent)' : 'var(--text-3)',
                      border: `1px solid ${offer.type === 'Stage' || offer.type === 'Alternance' ? 'rgba(200,255,62,0.25)' : 'var(--border)'}`,
                    }}
                  >
                    {offer.type}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs" style={{ color: 'var(--text-2)' }}>{offer.company}</span>
                  <span className="text-xs" style={{ color: 'var(--text-3)' }}>·</span>
                  <span className="text-xs" style={{ color: 'var(--text-3)' }}>{offer.location}</span>
                  <span className="text-xs" style={{ color: 'var(--text-3)' }}>·</span>
                  <span className="text-xs" style={{ color: 'var(--text-3)' }}>{offer.remote}</span>
                  <span className="text-xs" style={{ color: 'var(--text-3)' }}>·</span>
                  <span className="font-mono text-xs" style={{ color: 'var(--text-2)' }}>{offer.salary}</span>
                </div>
                <div className="mt-3 hidden sm:flex items-center gap-2 flex-wrap">
                  {offer.tags.slice(0, 4).map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md font-mono text-[10px]"
                      style={{ background: 'var(--bg-raised)', color: 'var(--text-3)', border: '1px solid var(--border)' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Score */}
              <div className="flex-shrink-0 hidden md:flex flex-col items-end justify-center min-w-[60px]">
                <div className="font-display font-extrabold text-xl" style={{ color: 'var(--accent)' }}>
                  {offer.score}
                </div>
                <div className="font-mono text-[9px] uppercase tracking-[0.15em]" style={{ color: 'var(--text-3)' }}>
                  match
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: 'var(--text-3)' }}>
          ── aperçu — vraies données arrivent en phase 2
        </p>
      </main>

      <Footer />
    </div>
  )
}
