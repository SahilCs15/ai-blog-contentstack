// Central Contentstack configuration for the CSR AI-blog app.
//
// ONE deployment serves every region. The active region is resolved at load
// from the `?region=` query param (see ./regions); its hosts + stack key +
// tokens become the `config` below. Each stack points its Live Preview
// environment URL at this app with its own `?region=<id>` (e.g.
// https://app/en-us?region=dev11), so the same build previews any cluster.
//
// `config` keeps a flat shape so every consumer (contentstack.ts, locale.ts,
// graphql.ts) is region-agnostic — it just reads the resolved values.

import { resolveRegion, getRegionConfig } from './regions'

function env(key: string, fallback: string): string {
  const v = (import.meta.env as Record<string, string | undefined>)[key]
  return v && v.length ? v : fallback
}

function host(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

const region = resolveRegion()
const rc = getRegionConfig(region)

export const config = {
  region,
  apiKey: rc.apiKey,
  deliveryToken: rc.deliveryToken,
  previewToken: rc.previewToken,
  environment: rc.environment,
  cdnHost: host(rc.cdnHost),
  previewHost: host(rc.previewHost),
  appHost: host(rc.appHost),
  locale: env('VITE_CS_LOCALE', 'en-us'),
} as const

export type AppConfig = typeof config
