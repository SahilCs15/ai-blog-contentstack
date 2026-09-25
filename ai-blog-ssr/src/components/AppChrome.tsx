'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

// Wraps the app shell (Synapse topbar + footer) around page content, EXCEPT on
// the standalone shoe-store route, which is a full-page landing with its own
// nav. On `/shoes` only the page content renders (no app chrome).
export default function AppChrome({
  header,
  footer,
  children,
}: {
  header: ReactNode
  footer: ReactNode
  children: ReactNode
}) {
  const pathname = usePathname()
  const bare = /\/shoes(\/|$)/.test(pathname || '')

  if (bare) return <>{children}</>

  return (
    <div className="shell">
      {header}
      <main className="main">{children}</main>
      {footer}
    </div>
  )
}
