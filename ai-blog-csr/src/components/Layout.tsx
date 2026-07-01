import { useEffect, useState } from 'react'
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { getLocales, stripLocaleFromPath, type Locale } from '../lib/locale'
import { getAvailableContentTypes } from '../lib/contentstack'
import { useLocale, useRegion } from '../lib/useLocale'
import { DEFAULT_REGION, isKnownRegion } from '../lib/regions'

// `ct` is the content type a link depends on; links whose content type has no
// entries in the active region are hidden. Items with ct undefined always show.
const NAV: Array<{ to: string; label: string; end: boolean; ct?: string }> = [
  { to: '', label: 'Home', end: true },
  { to: 'tools', label: 'Tools', end: false, ct: 'ai_tool' },
  { to: 'models', label: 'Models', end: false, ct: 'ai_model' },
  { to: 'companies', label: 'Companies', end: false, ct: 'ai_company' },
  { to: 'news', label: 'News', end: false, ct: 'ai_news' },
  { to: 'tutorials', label: 'Tutorials', end: false, ct: 'tutorial' },
  { to: 'glossary', label: 'Glossary', end: false, ct: 'glossary_term' },
  { to: 'compare', label: 'Compare', end: false, ct: 'comparison' },
  { to: 'use-cases', label: 'Use Cases', end: false, ct: 'use_case' },
  { to: 'reports', label: 'Reports', end: false, ct: 'industry_report' },
  { to: 'blog', label: 'Blog', end: false, ct: 'blog_post' },
  { to: 'all-fields', label: 'All Fields', end: false, ct: 'all_fields' },
  { to: 'graphql', label: 'GraphQL', end: false, ct: 'all_fields' },
]

export default function Layout() {
  const activeLocale = useLocale()
  const region = useRegion()
  const { region: pathRegion } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [locales, setLocales] = useState<Locale[]>([])
  // `null` = not yet resolved (show all to avoid a flash of an empty nav).
  const [available, setAvailable] = useState<Set<string> | null>(null)

  // Discover the stack's locales once for the switcher.
  useEffect(() => {
    let alive = true
    getLocales().then((ls) => alive && setLocales(ls))
    return () => {
      alive = false
    }
  }, [])

  // Discover which content types have entries, to hide empty nav links.
  useEffect(() => {
    let alive = true
    getAvailableContentTypes(activeLocale).then((s) => alive && setAvailable(s))
    return () => {
      alive = false
    }
  }, [activeLocale])

  // If the first segment isn't a known region, the URL is missing a region
  // prefix — canonicalize by prepending the default region (e.g. `/en-us/blog`
  // → `/dev11/en-us/blog`). The locale segment itself is rendered in place
  // whatever its value (the delivery API falls back to the master locale).
  if (!isKnownRegion(pathRegion)) {
    return <Navigate to={`/${DEFAULT_REGION}${location.pathname}${location.search}`} replace />
  }

  // Switch locale by swapping the `/:locale` segment, keeping region + rest.
  function onLocaleChange(next: string) {
    const rest = stripLocaleFromPath(location.pathname)
    navigate(`/${region}/${next}${rest === '/' ? '' : rest}${location.search}`)
  }

  const base = `/${region}/${activeLocale}`

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar__inner">
          <Link to={base} className="brand">
            <span className="brand__mark" aria-hidden>◆</span>
            <span className="brand__name">Synapse</span>
            <span className="brand__tag">CSR</span>
          </Link>
          <nav className="nav">
            {NAV.filter((n) => !n.ct || !available || available.has(n.ct)).map((n) => (
              <NavLink
                key={n.to}
                to={n.to ? `${base}/${n.to}` : base}
                end={n.end}
                className={({ isActive }) => `nav__link${isActive ? ' is-active' : ''}`}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <select
            className="locale-switcher"
            aria-label="Select locale"
            value={activeLocale}
            onChange={(e) => onLocaleChange(e.target.value)}
          >
            {(locales.length ? locales : [{ code: activeLocale, name: activeLocale }]).map((l) => (
              <option key={l.code} value={l.code}>
                {l.name} ({l.code})
              </option>
            ))}
          </select>
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
