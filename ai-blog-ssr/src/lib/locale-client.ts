// Client-safe locale + region helpers (no server-only imports).
//
// Kept separate from locale.ts so client components (LocaleLink, LivePreviewInit)
// can read the active locale/region from the URL without pulling in the server
// discovery fetch. Routes are `/{region}/{locale}/…`.

import { isKnownRegion } from './regions'

export const defaultLocale = process.env.NEXT_PUBLIC_CS_LOCALE || 'en-us'

/** The leading `/{region}` segment, if it is a known region. */
export function regionFromPath(pathname: string): string | undefined {
  const seg = pathname.split('/').filter(Boolean)[0]
  return isKnownRegion(seg) ? seg : undefined
}

/**
 * The locale segment, skipping a leading region. With `/{region}/{locale}/…`
 * the locale is segment 2 when a known region leads, else segment 1.
 */
export function localeFromPath(pathname: string): string | undefined {
  const segs = pathname.split('/').filter(Boolean)
  const seg = isKnownRegion(segs[0]) ? segs[1] : segs[0]
  // Locale codes look like `en` or `en-us`; never match real route segments.
  return seg && /^[a-z]{2}(-[a-z0-9]+)?$/i.test(seg) ? seg.toLowerCase() : undefined
}
