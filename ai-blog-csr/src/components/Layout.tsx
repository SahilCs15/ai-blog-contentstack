import { Link, NavLink, Outlet } from 'react-router-dom'

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/tools', label: 'Tools', end: false },
  { to: '/models', label: 'Models', end: false },
  { to: '/companies', label: 'Companies', end: false },
  { to: '/news', label: 'News', end: false },
  { to: '/tutorials', label: 'Tutorials', end: false },
  { to: '/glossary', label: 'Glossary', end: false },
  { to: '/compare', label: 'Compare', end: false },
  { to: '/use-cases', label: 'Use Cases', end: false },
  { to: '/reports', label: 'Reports', end: false },
  { to: '/blog', label: 'Blog', end: false },
]

export default function Layout() {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar__inner">
          <Link to="/" className="brand">
            <span className="brand__mark" aria-hidden>◆</span>
            <span className="brand__name">Synapse</span>
            <span className="brand__tag">CSR</span>
          </Link>
          <nav className="nav">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) => `nav__link${isActive ? ' is-active' : ''}`}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="main">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer__inner">
          <span>Synapse — the AI technology journal</span>
          <span className="footer__muted">
            Client-side rendered · Contentstack delivery SDK · Live Preview enabled
          </span>
        </div>
      </footer>
    </div>
  )
}
