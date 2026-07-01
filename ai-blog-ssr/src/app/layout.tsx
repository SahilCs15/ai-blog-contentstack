import type { Metadata } from 'next'
import LivePreviewInit from '@/components/LivePreviewInit'
import { getRegion } from '@/lib/region-server'
import { getConfig } from '@/lib/config'
import './globals.css'

export const metadata: Metadata = {
  title: 'Synapse · AI Technology Journal (SSR)',
  description: 'Clear, well-sourced writing about artificial intelligence — server-side rendered with Contentstack.',
}

// Root layout: only the document shell + the Live Preview bootstrap (which must
// mount on every route). The visual chrome (nav/footer) and locale handling live
// in app/[locale]/layout.tsx so they can read the active locale.
//
// The active region is resolved server-side (from the `?region=` query via
// middleware) and only its PUBLIC config (api key + preview token + hosts) is
// passed to the client LP bootstrap. The delivery token never leaves the server.
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const region = await getRegion()
  const c = getConfig(region)
  const livePreview = {
    apiKey: c.apiKey,
    environment: c.environment,
    previewToken: c.previewToken,
    previewHost: c.previewHost,
    appHost: c.appHost,
  }
  return (
    <html lang="en">
      <body>
        <LivePreviewInit config={livePreview} />
        {children}
      </body>
    </html>
  )
}
