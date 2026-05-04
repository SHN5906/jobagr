import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const tags = ['React', 'TypeScript', 'Python', 'Go', 'Rust', 'DevOps', 'Data', 'AI/ML', 'Backend', 'Mobile']

const steps = [
  {
    n: '01',
    title: 'On collecte',
    body: 'WeLoveDevs en source principale. Une seule API, tout le marché tech français.',
  },
  {
    n: '02',
    title: 'On normalise',
    body: 'Champs unifiés, doublons supprimés, salaires extraits. Le bruit dégage.',
  },
  {
    n: '03',
    title: 'Tu choisis',
    body: 'Filtres précis, vraie recherche, score de pertinence. Tu vois ce qui compte.',
  },
]

const reasons = [
  { kpi: '0', label: 'tab à ouvrir' },
  { kpi: '1', label: 'compte, toutes les sources' },
  { kpi: '∞', label: 'fois mieux que LinkedIn' },
]

export default function Home() {
  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100svh' }}>
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-14 overflow-hidden">
        <div className="bg-grid absolute inset-0 opacity-[0.35]" />
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
          <div
            className="anim-fade-up inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-10 text-xs font-mono"
            style={{ border: '1px solid var(--border)', color: 'var(--text-2)', animationDelay: '0.05s' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
            Construit pour les devs Epitech
          </div>

          <h1
            className="anim-fade-up font-display font-extrabold leading-[0.92] tracking-tight"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)', color: 'var(--text)', animationDelay: '0.15s' }}
          >
            LES JOBS TECH
            <br />
            <span style={{ color: 'var(--accent)' }}>SANS LE BRUIT.</span>
          </h1>

          <p
            className="anim-fade-up mt-7 text-lg max-w-xl mx-auto leading-relaxed"
            style={{ color: 'var(--text-2)', animationDelay: '0.28s' }}
          >
            On filtre, on normalise, on classe. Tu vois juste ce qui mérite ton CV.
          </p>

          <div
            className="anim-fade-up mt-10 flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: '0.4s' }}
          >
            <Link
              to="/register"
              className="px-6 py-3 text-sm font-display font-bold rounded-lg transition-all hover:opacity-90 hover:scale-[1.02]"
              style={{ background: 'var(--accent)', color: 'var(--accent-fg)', letterSpacing: '0.03em' }}
            >
              Explorer les offres
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 text-sm rounded-lg transition-all"
              style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}
            >
              J'ai déjà un compte
            </Link>
          </div>

          {/* Mini stats */}
          <div
            className="anim-fade-up mt-20 flex flex-wrap items-baseline justify-center gap-x-12 gap-y-6"
            style={{ animationDelay: '0.55s' }}
          >
            {reasons.map(r => (
              <div key={r.label} className="text-center">
                <div className="font-display font-extrabold text-3xl" style={{ color: 'var(--accent)' }}>{r.kpi}</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: 'var(--text-3)' }}>
                  {r.label}
                </div>
              </div>
            ))}
          </div>

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

        <div
          className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
          style={{ background: 'linear-gradient(to top, var(--bg), transparent)' }}
        />
      </section>

      {/* ── How it works ──────────────────────────────────── */}
      <section className="relative px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14 max-w-xl">
            <span
              className="font-mono text-[10px] uppercase tracking-[0.15em]"
              style={{ color: 'var(--text-3)' }}
            >
              ── Comment ça marche
            </span>
            <h2
              className="mt-4 font-display font-extrabold leading-tight"
              style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', color: 'var(--text)' }}
            >
              Trois étapes,<br />
              <span style={{ color: 'var(--accent)' }}>zéro friction.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: 'var(--border)' }}>
            {steps.map(s => (
              <div
                key={s.n}
                className="p-8 transition-colors"
                style={{ background: 'var(--bg)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg)')}
              >
                <div className="font-mono text-xs mb-6" style={{ color: 'var(--accent)' }}>
                  {s.n}
                </div>
                <h3 className="font-display font-bold text-2xl mb-3" style={{ color: 'var(--text)' }}>
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Source spotlight ──────────────────────────────── */}
      <section className="relative px-6 py-20">
        <div
          className="max-w-6xl mx-auto rounded-2xl px-10 py-14 relative overflow-hidden"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
          <div className="bg-grid absolute inset-0 opacity-20" />
          <div
            className="absolute pointer-events-none rounded-full"
            style={{
              width: 320, height: 320,
              top: -80, right: -80,
              background: 'radial-gradient(circle, rgba(200,255,62,0.08) 0%, transparent 65%)',
            }}
          />

          <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span
                className="font-mono text-[10px] uppercase tracking-[0.15em]"
                style={{ color: 'var(--accent)' }}
              >
                ── Partenaire officiel
              </span>
              <h3
                className="mt-4 font-display font-extrabold leading-tight"
                style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', color: 'var(--text)' }}
              >
                Données réelles.<br />
                Marché réel.
              </h3>
              <p className="mt-5 text-sm leading-relaxed max-w-md" style={{ color: 'var(--text-2)' }}>
                On bosse main dans la main avec WeLoveDevs — la plateforme de recrutement tech française.
                Pas de scraping bancal, pas de fake jobs : que des offres vivantes.
              </p>
              <a
                href="https://welovedevs.com"
                target="_blank"
                rel="noreferrer"
                className="mt-7 inline-flex items-center gap-2 text-sm transition-opacity hover:opacity-80"
                style={{ color: 'var(--accent)' }}
              >
                Voir WeLoveDevs ↗
              </a>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { k: 'API',    v: 'OpenAPI 3.0' },
                { k: 'Limit',  v: '1 req/sec' },
                { k: 'Auth',   v: '@epitech.eu' },
                { k: 'Update', v: 'Live' },
              ].map(item => (
                <div
                  key={item.k}
                  className="rounded-lg p-4"
                  style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
                >
                  <div className="font-mono text-[10px] uppercase tracking-[0.15em] mb-2" style={{ color: 'var(--text-3)' }}>
                    {item.k}
                  </div>
                  <div className="font-display font-bold text-lg" style={{ color: 'var(--text)' }}>
                    {item.v}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────── */}
      <section className="relative px-6 py-24 overflow-hidden">
        <div className="bg-grid absolute inset-0 opacity-[0.2]" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2
            className="font-display font-extrabold leading-[0.95]"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', color: 'var(--text)' }}
          >
            Prêt à arrêter<br />
            <span style={{ color: 'var(--accent)' }}>de scroller pour rien ?</span>
          </h2>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/register"
              className="px-6 py-3 text-sm font-display font-bold rounded-lg transition-all hover:opacity-90 hover:scale-[1.02]"
              style={{ background: 'var(--accent)', color: 'var(--accent-fg)', letterSpacing: '0.03em' }}
            >
              Créer mon compte
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
