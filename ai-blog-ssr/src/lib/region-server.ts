// Server-side active-region resolver. Reads the `x-region` header set by
// middleware (from the `?region=` query param) and validates it against the
// region registry, falling back to the default. Used inside the server fetch
// helpers so their signatures stay region-agnostic.

import { headers } from 'next/headers'
import { resolveRegion } from './regions'

export async function getRegion(): Promise<string> {
  try {
    const h = await headers()
    return resolveRegion(h.get('x-region'))
  } catch {
    // headers() unavailable outside a request scope — fall back to default.
    return resolveRegion(undefined)
  }
}
