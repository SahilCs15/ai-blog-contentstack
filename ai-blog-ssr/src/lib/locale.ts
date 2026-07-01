// Locale resolution + stack locale discovery for the SSR app.
//
// On the server there is no `window`, so locale is resolved from values the
// route hands us, highest priority first:
//   1. The `/[locale]/...` route segment — the source of truth for both a
//      standalone visitor and the Visual Builder, which switches locale by
//      navigating the path (LivePreviewInit keeps the path in sync).
//   2. The `?locale=` search param — a fallback only when no path locale is
//      present.
//   3. `defaultLocale` — the build-time default (en-us).
//
// The available locale list is discovered from the delivery `/v3/locales`
// endpoint per region so the switcher always matches the active stack.

import { getConfig, defaultLocale } from './config'

export { defaultLocale }

export interface Locale {
  code: string
  name: string
}

// Locale discovery is region-dependent, so cache per region (a single
// module-level cache would serve the first region's locales to every region).
const localesByRegion = new Map<string, Promise<Locale[]>>()

/**
 * Discover a region's locales from its delivery API. Cached per region. Falls
 * back to just the default locale if the endpoint is unavailable so a discovery
 * failure never breaks rendering.
 */
export function getLocales(region: string): Promise<Locale[]> {
  const cached = localesByRegion.get(region)
  if (cached) return cached
  const config = getConfig(region)
  const promise = (async () => {
    try {
      const url = `https://${config.cdnHost}/v3/locales?environment=${encodeURIComponent(config.environment)}`
      const res = await fetch(url, {
        headers: { api_key: config.apiKey, access_token: config.deliveryToken },
        // locales rarely change; let Next cache the response.
        next: { revalidate: 3600 },
      })
      const data = (await res.json()) as { locales?: Array<{ code?: string; name?: string }> }
      const locales = (data.locales ?? [])
        .filter((l): l is { code: string; name?: string } => Boolean(l.code))
        .map((l) => ({ code: l.code, name: l.name || l.code }))
      if (!locales.length) throw new Error('no locales returned')
      return locales
    } catch {
      return [{ code: defaultLocale, name: defaultLocale }]
    }
  })()
  localesByRegion.set(region, promise)
  return promise
}

/**
 * Resolve the active locale for a request. `pathLocale` (the `/[locale]/`
 * segment) is the source of truth and wins over `searchLocale` (the `?locale=`
 * param); both fall back to default. The Visual Builder switches locale by
 * navigating the path, so the param is only a fallback when no path locale is
 * present.
 */
export function resolveLocale(pathLocale?: string, searchLocale?: string): string {
  return pathLocale || searchLocale || defaultLocale
}
