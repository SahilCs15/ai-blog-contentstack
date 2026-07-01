// useLocale / useRegion: the active locale and region for the current route.
//
// Routes are `/:region/:locale/...`. Locale source of truth is the `?locale=`
// query param (Visual Builder) falling back to the `/:locale/` route segment.
// Region comes from the `/:region/` route segment, falling back to the resolved
// default. Components use these to build region+locale-aware links and to key
// data fetches so a switch re-fetches in the new locale/region.

import { useParams, useSearchParams } from 'react-router-dom'
import { defaultLocale } from './locale'
import { resolveRegion, isKnownRegion } from './regions'

export function useLocale(): string {
  const { locale } = useParams()
  const [search] = useSearchParams()
  return search.get('locale') || locale || defaultLocale
}

export function useRegion(): string {
  const { region } = useParams()
  return isKnownRegion(region) ? (region as string) : resolveRegion()
}
