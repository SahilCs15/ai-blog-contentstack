// Region routing for the multi-region SSR app. Routes are `/{region}/{locale}/…`.
// The region (first path segment) is validated and carried in an `x-region`
// request header so server code can read it via `getRegion()` without every page
// threading it through. A region as a PATH SEGMENT (not a query param) survives
// the Visual Builder concatenating an entry's `url` field onto the env URL.

import { NextResponse, type NextRequest } from 'next/server'
import { DEFAULT_REGION, resolveRegion } from '@/lib/regions'
import { defaultLocale } from '@/lib/locale-client'

export function middleware(req: NextRequest) {
  const url = req.nextUrl
  const segs = url.pathname.split('/').filter(Boolean)
  const first = segs[0]

  // First segment is a known region.
  if (first && resolveRegion(first) === first) {
    if (segs.length === 1) {
      // `/{region}` with no locale → add the default locale.
      url.pathname = `/${first}/${defaultLocale}`
      return NextResponse.redirect(url)
    }
    const headers = new Headers(req.headers)
    headers.set('x-region', first)
    return NextResponse.next({ request: { headers } })
  }

  // No valid region prefix (root, or a locale-first path) → prepend the default.
  url.pathname = `/${DEFAULT_REGION}${url.pathname === '/' ? '' : url.pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
