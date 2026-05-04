import { Link } from 'react-router-dom'

const links = {
  produit:    [{ label: 'Offres',      to: '/dashboard' }, { label: 'Connexion',  to: '/login' }, { label: 'Inscription', to: '/register' }],
  ressources: [{ label: 'WeLoveDevs',  href: 'https://welovedevs.com' }, { label: 'API docs', href: 'https://epi-api.welovedevs.com/' }],
  équipe:     [{ label: 'Sohan',  meta: 'Frontend' }, { label: 'Rayane', meta: 'Sécurité' }, { label: 'Fael',   meta: 'API' }, { label: 'Liam',   meta: 'Data' }],
}

export default function Footer() {
  return (
    <footer
      className="relative mt-32 pt-16 pb-10 px-6"
      style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link
              to="/"
              className="font-display font-extrabold text-base tracking-widest"
              style={{ color: 'var(--accent)', letterSpacing: '0.12em' }}
            >
              JOBRYX
            </Link>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--text-3)' }}>
              Un projet Epitech.<br />
              Construit par des devs, pour des devs.
            </p>
          </div>

          {/* Produit */}
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.15em] mb-4" style={{ color: 'var(--text-3)' }}>
              Produit
            </div>
            <ul className="flex flex-col gap-2.5">
              {links.produit.map(l => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm transition-colors" style={{ color: 'var(--text-2)' }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sources */}
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.15em] mb-4" style={{ color: 'var(--text-3)' }}>
              Sources
            </div>
            <ul className="flex flex-col gap-2.5">
              {links.ressources.map(l => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm transition-colors"
                    style={{ color: 'var(--text-2)' }}
                  >
                    {l.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Équipe */}
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.15em] mb-4" style={{ color: 'var(--text-3)' }}>
              Équipe
            </div>
            <ul className="flex flex-col gap-2.5">
              {links.équipe.map(p => (
                <li key={p.label} className="flex items-baseline gap-2">
                  <span className="text-sm" style={{ color: 'var(--text-2)' }}>{p.label}</span>
                  <span className="font-mono text-[10px]" style={{ color: 'var(--text-3)' }}>{p.meta}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-6 flex items-center justify-between flex-wrap gap-4"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <span className="font-mono text-xs" style={{ color: 'var(--text-3)' }}>
            © 2026 Jobryx — Bachelor Promo 2028
          </span>
          <span className="font-mono text-xs flex items-center gap-2" style={{ color: 'var(--text-3)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
            v0.1 · Phase 1
          </span>
        </div>
      </div>
    </footer>
  )
}
