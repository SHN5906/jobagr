import { useState, useEffect, useCallback } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../hooks/useAuth'
import { apiClient, type Offer } from '../services/api'

const CONTRACT_FILTERS = ['Tous', 'CDI', 'STAGE', 'ALTERNANCE', 'FREELANCE']
const CONTRACT_LABELS: Record<string, string> = {
  CDI: 'CDI', STAGE: 'Stage', ALTERNANCE: 'Alternance', FREELANCE: 'Freelance',
}

function parseTags(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw as string[]
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch { return [] }
  }
  return []
}

export default function Dashboard() {
  const { user } = useAuth()
  const [active, setActive] = useState('Tous')
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [offers, setOffers] = useState<Offer[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOffers = useCallback(async (contract: string, q: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.getJobs({ contract: contract === 'Tous' ? undefined : contract, q: q || undefined })
      setOffers(res.jobs)
      setTotal(res.total)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => { fetchOffers('Tous', '') }, [fetchOffers])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setQuery(search), 350)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => { fetchOffers(active, query) }, [active, query, fetchOffers])

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
            {total > 0 ? `${total} offre${total > 1 ? 's' : ''} correspondent à ta recherche.` : 'Aucune offre pour cette recherche.'}
          </p>
        </div>

        {/* ── Search + Filters ────────────────────────────── */}
        <div className="anim-fade-up mt-12 flex flex-col gap-4" style={{ animationDelay: '0.1s' }}>
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
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onBlur={e  => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {CONTRACT_FILTERS.map(f => (
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
                {f === 'Tous' ? 'Tous' : CONTRACT_LABELS[f] ?? f}
              </button>
            ))}
            <span className="ml-auto font-mono text-xs" style={{ color: 'var(--text-3)' }}>
              {loading ? '…' : `${total} offre${total > 1 ? 's' : ''}`}
            </span>
          </div>
        </div>

        {/* ── Offer feed ──────────────────────────────────── */}
        <div className="anim-fade-up mt-6 flex flex-col gap-3" style={{ animationDelay: '0.2s' }}>

          {error && (
            <div className="rounded-xl p-4 text-sm text-center" style={{ background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)', color: '#ff6060' }}>
              {error}
            </div>
          )}

          {loading && !error && (
            <div className="rounded-xl p-8 text-center font-mono text-xs" style={{ color: 'var(--text-3)', border: '1px solid var(--border)' }}>
              Chargement…
            </div>
          )}

          {!loading && !error && offers.length === 0 && (
            <div className="rounded-xl p-8 text-center font-mono text-xs" style={{ color: 'var(--text-3)', border: '1px solid var(--border)' }}>
              Aucune offre trouvée.
            </div>
          )}

          {!loading && offers.map(offer => {
            const tags = parseTags(offer.tags)
            const isJunior = offer.contract === 'STAGE' || offer.contract === 'ALTERNANCE'
            return (
              <div
                key={offer.id}
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
                  {offer.company[0]}
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
                        background: isJunior ? 'rgba(200,255,62,0.1)' : 'var(--bg-raised)',
                        color: isJunior ? 'var(--accent)' : 'var(--text-3)',
                        border: `1px solid ${isJunior ? 'rgba(200,255,62,0.25)' : 'var(--border)'}`,
                      }}
                    >
                      {CONTRACT_LABELS[offer.contract] ?? offer.contract}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs" style={{ color: 'var(--text-2)' }}>{offer.company}</span>
                    <span className="text-xs" style={{ color: 'var(--text-3)' }}>·</span>
                    <span className="text-xs" style={{ color: 'var(--text-3)' }}>{offer.location}</span>
                    <span className="text-xs" style={{ color: 'var(--text-3)' }}>·</span>
                    <span className="text-xs" style={{ color: 'var(--text-3)' }}>{offer.work_mode}</span>
                    {offer.salary && <>
                      <span className="text-xs" style={{ color: 'var(--text-3)' }}>·</span>
                      <span className="font-mono text-xs" style={{ color: 'var(--text-2)' }}>{offer.salary}</span>
                    </>}
                  </div>
                  <div className="mt-3 hidden sm:flex items-center gap-2 flex-wrap">
                    {tags.slice(0, 4).map(tag => (
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
            )
          })}
        </div>
      </main>

      <Footer />
    </div>
  )
}
