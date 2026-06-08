import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import LivePreviewInit from '@/components/LivePreviewInit'
import './globals.css'

export const metadata: Metadata = {
  title: 'Synapse · AI Technology Journal (SSR)',
  description: 'Clear, well-sourced writing about artificial intelligence — server-side rendered with Contentstack.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LivePreviewInit />
        <div className="shell">
          <header className="topbar">
            <div className="topbar__inner">
              <Link href="/" className="brand">
                <span className="brand__mark" aria-hidden>◆</span>
                <span className="brand__name">Synapse</span>
                <span className="brand__tag">SSR</span>
              </Link>
              <Nav />
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
      </body>
    </html>
  )
}
