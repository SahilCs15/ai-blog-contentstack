'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { Locale } from '@/lib/locale'

// `ct` is the content type a link depends on; links whose content type has no
// entries in the active region are hidden. Items with ct undefined always show.
const NAV: Array<{ href: string; label: string; ct?: string }> = [
  { href: '', label: 'Home' },
  { href: '/tools', label: 'Tools', ct: 'ai_tool' },
  { href: '/models', label: 'Models', ct: 'ai_model' },
  { href: '/companies', label: 'Companies', ct: 'ai_company' },
  { href: '/news', label: 'News', ct: 'ai_news' },
  { href: '/tutorials', label: 'Tutorials', ct: 'tutorial' },
  { href: '/glossary', label: 'Glossary', ct: 'glossary_term' },
  { href: '/compare', label: 'Compare', ct: 'comparison' },
  { href: '/use-cases', label: 'Use Cases', ct: 'use_case' },
  { href: '/reports', label: 'Reports', ct: 'industry_report' },
  { href: '/blog', label: 'Blog', ct: 'blog_post' },
  { href: '/all-fields', label: 'All Fields', ct: 'all_fields' },
  { href: '/graphql', label: 'GraphQL', ct: 'all_fields' },
]

/** Strip the leading `/<region>/<locale>` prefix → the bare path. */
function pathWithoutPrefix(pathname: string, prefix: string): string {
  if (pathname === prefix) return ''
  return pathname.startsWith(prefix + '/') ? pathname.slice(prefix.length) : pathname
}

export default function Nav({ region, locale, locales = [], available }: { region: string; locale: string; locales?: Locale[]; available?: string[] }) {
  const pathname = usePathname()
  const router = useRouter()
  const search = useSearchParams()
  const base = `/${region}/${locale}`
  const rel = pathWithoutPrefix(pathname, base)
  const isActive = (href: string) => (href === '' ? rel === '' : rel.startsWith(href))

  // Switch locale by swapping the `/<locale>` segment, keeping region + the rest.
  function onLocaleChange(next: string) {
    const qs = search.toString()
    router.push(`/${region}/${next}${rel}${qs ? `?${qs}` : ''}`)
  }

  return (
    <>
      <nav className="nav">
        {NAV.filter((n) => !n.ct || !available || available.includes(n.ct)).map((n) => (
          <Link
            key={n.href}
            href={`${base}${n.href}`}
            className={`nav__link${isActive(n.href) ? ' is-active' : ''}`}
          >
            {n.label}
          </Link>
        ))}
      </nav>
      <select
        className="locale-switcher"
        aria-label="Select locale"
        value={locale}
        onChange={(e) => onLocaleChange(e.target.value)}
      >
        {(locales.length ? locales : [{ code: locale, name: locale }]).map((l) => (
          <option key={l.code} value={l.code}>
            {l.name} ({l.code})
          </option>
        ))}
      </select>
    </>
  )
}
