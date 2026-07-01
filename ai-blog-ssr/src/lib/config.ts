// Contentstack configuration for the SSR AI-blog app — MULTI-REGION.
//
// ONE deployment serves every region. The active region is resolved per request
// (see ./region-server, fed by middleware from `?region=`) and passed to
// getConfig(region), which returns the flat shape every consumer expects. Each
// stack points its Live Preview environment URL at this app with its own
// `?region=<id>` so the same build previews any cluster.
//
// SERVER-ONLY: getConfig reads per-region tokens from runtime env. The client
// LivePreviewInit gets the public subset as props, never importing this module.

import { getRegionConfig } from './regions'

function host(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

/** Build the active config for a region (hosts + stack key + tokens). */
export function getConfig(region: string) {
  const rc = getRegionConfig(region)
  return {
    region,
    apiKey: rc.apiKey,
    deliveryToken: rc.deliveryToken,
    previewToken: rc.previewToken,
    environment: rc.environment,
    cdnHost: host(rc.cdnHost),
    previewHost: host(rc.previewHost),
    appHost: host(rc.appHost),
    locale: defaultLocale,
  } as const
}

/** Master/default locale — region-agnostic (other locales come from the URL). */
export const defaultLocale = process.env.NEXT_PUBLIC_CS_LOCALE || 'en-us'

export type AppConfig = ReturnType<typeof getConfig>
