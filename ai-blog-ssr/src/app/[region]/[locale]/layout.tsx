import Link from 'next/link'
import Nav from '@/components/Nav'
import { getLocales } from '@/lib/locale'
import { getAvailableContentTypes } from '@/lib/contentstack'
import { getRegion } from '@/lib/region-server'

// Locale-scoped layout: renders the shell for whatever `[locale]` segment is in
// the URL. No redirect on unknown locales — the data layer resolves the locale
// and the delivery API falls back to the master locale's content, so the app
// never navigates itself away from the URL the visitor (or Builder) loaded.
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ region: string; locale: string }>
}) {
  const { locale } = await params
  const region = await getRegion()
  const [locales, available] = await Promise.all([getLocales(region), getAvailableContentTypes(locale)])

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar__inner">
          <Link href={`/${region}/${locale}`} className="brand">
            <span className="brand__mark" aria-hidden>◆</span>
            <span className="brand__name">Synapse</span>
            <span className="brand__tag">SSR</span>
          </Link>
          <Nav region={region} locale={locale} locales={locales} available={available} />
        </div>
      </header>

      <main className="main">{children}</main>

      <footer className="footer">
        <div className="footer__inner">
          <span>Synapse — the AI technology journal</span>
          <span className="footer__muted">
            Server-side rendered · Next.js App Router · Contentstack · Live Preview enabled
          </span>
        </div>
      </footer>
    </div>
  )
}
