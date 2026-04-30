import Navbar from '../components/Navbar'
import { useAuth } from '../hooks/useAuth'

const metrics = [
  { label: 'Offres disponibles',  value: '—',  note: 'Phase 2' },
  { label: 'Score de pertinence', value: '—',  note: 'Phase 3' },
  { label: 'Recommandations IA',  value: '—',  note: 'Phase 3' },
]

const placeholderOffers = [
  { title: 'Développeur Backend Python', company: 'TechCorp', location: 'Paris', type: 'CDI',   tags: ['Python', 'FastAPI', 'PostgreSQL'] },
  { title: 'Ingénieur DevOps',           company: 'CloudNine', location: 'Lyon',  type: 'CDI',   tags: ['Docker', 'K8s', 'Terraform'] },
  { title: 'Stage Data Engineer',        company: 'DataLab',   location: 'Remote', type: 'Stage', tags: ['Spark', 'dbt', 'Airflow'] },
  { title: 'Frontend React',             company: 'Startup.io', location: 'Bordeaux', type: 'CDI', tags: ['React', 'TypeScript', 'Tailwind'] },
]

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100svh' }}>
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pt-24 pb-16">

        {/* ── Header ──────────────────────────────────────── */}
        <div className="anim-fade-up">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-xs uppercase tracking-[0.15em]" style={{ color: 'var(--text-3)' }}>
              Bienvenue,
            </span>
          </div>
          <h1
            className="font-display font-extrabold leading-tight"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: 'var(--text)' }}
          >
            {user?.username}
            <span style={{ color: 'var(--accent)' }}>.</span>
          </h1>
        </div>

        {/* ── Metrics ─────────────────────────────────────── */}
        <div
          className="anim-fade-up mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4"
          style={{ animationDelay: '0.1s' }}
        >
          {metrics.map(m => (
            <div
              key={m.label}
              className="rounded-xl p-6"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.15em] mb-3" style={{ color: 'var(--text-3)' }}>
                {m.label}
              </div>
              <div className="font-display font-bold text-4xl" style={{ color: 'var(--text)' }}>
                {m.value}
              </div>
              <div
                className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono text-[10px]"
                style={{ background: 'var(--bg-raised)', color: 'var(--text-3)', border: '1px solid var(--border)' }}
              >
                <span className="w-1 h-1 rounded-full" style={{ background: 'var(--border-2)' }} />
                {m.note}
              </div>
            </div>
          ))}
        </div>

        {/* ── Offer feed ──────────────────────────────────── */}
        <div className="anim-fade-up mt-12" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-lg" style={{ color: 'var(--text)' }}>
              Dernières offres
            </h2>
            <span className="font-mono text-xs" style={{ color: 'var(--text-3)' }}>
              Données disponibles en Phase 2
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {placeholderOffers.map(offer => (
              <div
                key={offer.title}
                className="flex items-center justify-between rounded-xl px-6 py-5 transition-colors cursor-pointer"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-2)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className="font-display font-semibold text-sm" style={{ color: 'var(--text)' }}>
                      {offer.title}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full font-mono text-[10px]"
                      style={{
                        background: offer.type === 'Stage' ? 'rgba(200,255,62,0.1)' : 'var(--bg-raised)',
                        color: offer.type === 'Stage' ? 'var(--accent)' : 'var(--text-3)',
                        border: `1px solid ${offer.type === 'Stage' ? 'rgba(200,255,62,0.25)' : 'var(--border)'}`,
                      }}
                    >
                      {offer.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-xs" style={{ color: 'var(--text-3)' }}>{offer.company}</span>
                    <span className="text-xs" style={{ color: 'var(--text-3)' }}>·</span>
                    <span className="text-xs" style={{ color: 'var(--text-3)' }}>{offer.location}</span>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 ml-6 flex-shrink-0">
                  {offer.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-md font-mono text-[10px]"
                      style={{ background: 'var(--bg-raised)', color: 'var(--text-3)', border: '1px solid var(--border)' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
