// Locale resolution + stack locale discovery for the CSR app.
//
// Locale flows from three sources, highest priority first:
//   1. `?locale=` query param — set by the Visual Builder when an editor
//      switches locale inside the preview iframe. This is the ONLY signal the
//      Live Preview SDK gives us for the active locale (it has no `.locale`
//      getter), so reading the URL is the version-independent way to honour it.
//   2. The `/:locale/...` route segment — how a standalone visitor picks locale.
//   3. `config.locale` — the build-time default (en-us) when nothing else applies.
//
// The available locale list is discovered from the stack at runtime (the
// delivery API `/v3/locales` endpoint) so the switcher always matches the stack.

import { stack } from './contentstack'
import { config } from './config'
import { isKnownRegion } from './regions'

export interface Locale {
  code: string
  name: string
}

let localesPromise: Promise<Locale[]> | null = null

/** The locale set known so far; seeded with the default so the app always has one. */
let knownCodes: Set<string> = new Set([config.locale])

/**
 * Discover the stack's locales via the delivery client. Cached after the first
 * call. Falls back to just the default locale if the endpoint is unavailable so
 * the app never breaks on a discovery failure.
 */
export function getLocales(): Promise<Locale[]> {
  if (localesPromise) return localesPromise
  localesPromise = (async () => {
    try {
      const client = stack.getClient()
      const res = await client.get('/locales', { params: { include_count: false } })
      const raw = (res?.data?.locales ?? []) as Array<{ code?: string; name?: string }>
      const locales = raw
        .filter((l): l is { code: string; name?: string } => Boolean(l.code))
        .map((l) => ({ code: l.code, name: l.name || l.code }))
      if (!locales.length) throw new Error('no locales returned')
      knownCodes = new Set(locales.map((l) => l.code))
      return locales
    } catch {
      // Discovery failed — fall back to the default locale only.
      return [{ code: config.locale, name: config.locale }]
    }
  })()
  return localesPromise
}

/** True if `code` is the default locale or a locale discovery has confirmed. */
export function isKnownLocale(code: string): boolean {
  return knownCodes.has(code)
}

/** The default locale (build-time config). */
export const defaultLocale = config.locale

/**
 * Extract the locale segment from a pathname, skipping a leading region segment.
 * Routes are `/:region/:locale/...`, so the locale is segment 2 when a known
 * region leads, else segment 1.
 */
export function localeFromPath(pathname: string): string | undefined {
  const segs = pathname.split('/').filter(Boolean)
  const seg = isKnownRegion(segs[0]) ? segs[1] : segs[0]
  // Locale codes look like `en` or `en-us`; never match real route segments.
  return seg && /^[a-z]{2}(-[a-z0-9]+)?$/i.test(seg) ? seg.toLowerCase() : undefined
}

/**
 * Strip the leading `/:region/:locale` segments, returning the bare path that
 * matches a content `url` field — e.g. `/dev23/es/graphql` → `/graphql`. Drops a
 * leading region (if present) then a locale (if present).
 */
export function stripLocaleFromPath(pathname: string): string {
  let segs = pathname.split('/').filter(Boolean)
  if (isKnownRegion(segs[0])) segs = segs.slice(1)
  if (segs[0] && /^[a-z]{2}(-[a-z0-9]+)?$/i.test(segs[0])) segs = segs.slice(1)
  return '/' + segs.join('/')
}

/**
 * Resolve the active locale at fetch time. Reads the `?locale=` query param
 * first (set by the Visual Builder when editing a locale), then the leading
 * `/:locale/` path segment (how a standalone visitor picks locale), then falls
 * back to the default. Loaders call this as their default arg, so a single
 * source of truth threads the locale through every fetch without each page
 * having to pass it explicitly.
 */
export function resolveLocale(pathLocale?: string): string {
  if (typeof window !== 'undefined') {
    const fromQuery = new URLSearchParams(window.location.search).get('locale')
    if (fromQuery) return fromQuery
    const fromPath = localeFromPath(window.location.pathname)
    if (fromPath) return fromPath
  }
  if (pathLocale) return pathLocale
  return defaultLocale
}
