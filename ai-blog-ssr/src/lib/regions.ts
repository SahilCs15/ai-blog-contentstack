// Region registry for the multi-region SSR app. ONE build serves every region;
// the active region comes from the `/{region}/{locale}/...` path.
//
// This file holds ONLY the registry of region ids (+ display labels). Every
// environment-specific VALUE comes from env vars, keyed per region. getRegionConfig
// runs SERVER-SIDE only (config.ts is never imported by a client component — the
// client LivePreviewInit gets the public subset as props), so the values can be
// plain server-only env vars (no NEXT_PUBLIC needed):
//   CS_API_KEY_<REGION>      CS_ENVIRONMENT_<REGION>   CS_CDN_HOST_<REGION>
//   CS_PREVIEW_HOST_<REGION> CS_APP_HOST_<REGION>      CS_DELIVERY_TOKEN_<REGION>
//   CS_PREVIEW_TOKEN_<REGION>
// <REGION> = id upper-cased, non-alphanumerics → '_' (e.g. aws-na → AWS_NA).
// DEFAULT_REGION is NEXT_PUBLIC because LocaleLink (client) reads it.

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

function envKey(region: string): string {
  return region.toUpperCase().replace(/[^A-Z0-9]/g, '_')
}

export const DEFAULT_REGION = process.env.NEXT_PUBLIC_CS_DEFAULT_REGION || 'dev11'

/** True if `region` is a registered region id. */
export function isKnownRegion(region: string | undefined | null): boolean {
  return Boolean(region && region in LABELS)
}

/** Validate a region value (from header/path) and fall back to the default. */
export function resolveRegion(value?: string | null): string {
  if (value && value in LABELS) return value
  return isKnownRegion(DEFAULT_REGION) ? DEFAULT_REGION : 'dev11'
}

/** Resolve a region's full config from env vars. SERVER-ONLY. */
export function getRegionConfig(region: string): RegionConfig {
  const id = isKnownRegion(region) ? region : resolveRegion()
  const k = envKey(id)
  return {
    label: LABELS[id] ?? id,
    apiKey: process.env[`CS_API_KEY_${k}`] || '',
    environment: process.env[`CS_ENVIRONMENT_${k}`] || 'development',
    cdnHost: process.env[`CS_CDN_HOST_${k}`] || '',
    previewHost: process.env[`CS_PREVIEW_HOST_${k}`] || '',
    appHost: process.env[`CS_APP_HOST_${k}`] || '',
    deliveryToken: process.env[`CS_DELIVERY_TOKEN_${k}`] || '',
    previewToken: process.env[`CS_PREVIEW_TOKEN_${k}`] || '',
  }
}

export function isRegionConfigured(region: string): boolean {
  const c = getRegionConfig(region)
  return Boolean(c.apiKey && c.deliveryToken)
}

export function listRegions(): Array<{ id: string; label: string; configured: boolean }> {
  return REGION_IDS.map((id) => ({ id, label: LABELS[id], configured: isRegionConfigured(id) }))
}
