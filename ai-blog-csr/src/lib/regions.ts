// Region registry for the multi-region CSR app. ONE build serves every region;
// the active region comes from the `/{region}/{locale}/...` path.
//
// This file holds ONLY the registry of region ids (+ display labels). Every
// environment-specific VALUE — api key, environment, cdn/preview/app hosts,
// delivery & preview tokens — comes from env vars, keyed per region:
//   VITE_CS_API_KEY_<REGION>        VITE_CS_ENVIRONMENT_<REGION>
//   VITE_CS_CDN_HOST_<REGION>       VITE_CS_PREVIEW_HOST_<REGION>
//   VITE_CS_APP_HOST_<REGION>       VITE_CS_DELIVERY_TOKEN_<REGION>
//   VITE_CS_PREVIEW_TOKEN_<REGION>
// <REGION> = id upper-cased, non-alphanumerics → '_' (e.g. aws-na → AWS_NA).

export interface RegionConfig {
  label: string
  apiKey: string
  environment: string
  cdnHost: string
  previewHost: string
  appHost: string
  deliveryToken: string
  previewToken: string
}

// Known region ids + labels. Values live in env (see header).
const LABELS: Record<string, string> = {
  dev11: 'Dev11 (nonprod)',
  dev23: 'Dev23 (nonprod)',
  'aws-stag': 'AWS Stage',
  'azure-na-stag': 'Azure NA Stage',
  'gcp-na-stag': 'GCP NA Stage',
  'aws-na': 'AWS NA (prod)',
  'aws-eu': 'AWS EU (prod)',
  'aws-au': 'AWS AU (prod)',
  'azure-na': 'Azure NA (prod)',
  'azure-eu': 'Azure EU (prod)',
  'gcp-na': 'GCP NA (prod)',
  'gcp-eu': 'GCP EU (prod)',
}

export const REGION_IDS = Object.keys(LABELS)

function envVal(name: string): string {
  const v = (import.meta.env as Record<string, string | undefined>)[name]
  return v && v.length ? v : ''
}

function envKey(region: string): string {
  return region.toUpperCase().replace(/[^A-Z0-9]/g, '_')
}

export const DEFAULT_REGION = envVal('VITE_CS_DEFAULT_REGION') || 'dev11'

/** True if `region` is a registered region id. */
export function isKnownRegion(region: string | undefined | null): boolean {
  return Boolean(region && region in LABELS)
}

/**
 * Resolve the active region from the FIRST path segment (`/dev23/en-us/...`),
 * else the default. A path segment (not a query param) survives the Visual
 * Builder concatenating an entry's `url` field onto the env URL.
 */
export function resolveRegion(): string {
  if (typeof window !== 'undefined') {
    const seg = window.location.pathname.split('/').filter(Boolean)[0]
    if (isKnownRegion(seg)) return seg
  }
  return isKnownRegion(DEFAULT_REGION) ? DEFAULT_REGION : 'dev11'
}

/** Resolve a region's full config from env vars. */
export function getRegionConfig(region: string): RegionConfig {
  const id = isKnownRegion(region) ? region : resolveRegion()
  const k = envKey(id)
  return {
    label: LABELS[id] ?? id,
    apiKey: envVal(`VITE_CS_API_KEY_${k}`),
    environment: envVal(`VITE_CS_ENVIRONMENT_${k}`) || 'development',
    cdnHost: envVal(`VITE_CS_CDN_HOST_${k}`),
    previewHost: envVal(`VITE_CS_PREVIEW_HOST_${k}`),
    appHost: envVal(`VITE_CS_APP_HOST_${k}`),
    deliveryToken: envVal(`VITE_CS_DELIVERY_TOKEN_${k}`),
    previewToken: envVal(`VITE_CS_PREVIEW_TOKEN_${k}`),
  }
}

/** True when a region has its api key + delivery token wired in env. */
export function isRegionConfigured(region: string): boolean {
  const c = getRegionConfig(region)
  return Boolean(c.apiKey && c.deliveryToken)
}

/** All known regions (for a region switcher UI). */
export function listRegions(): Array<{ id: string; label: string; configured: boolean }> {
  return REGION_IDS.map((id) => ({ id, label: LABELS[id], configured: isRegionConfigured(id) }))
}
