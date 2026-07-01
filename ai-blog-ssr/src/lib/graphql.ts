// GraphQL Preview client for the /graphql page (server-side).
//
// Runs on the server. Same two-host model as REST: with a live_preview hash
// (passed from the page URL inside Visual Builder) it queries the GraphQL
// *preview* host with the `live_preview` header → draft content; otherwise the
// GraphQL delivery host → published content.
//
// The GraphQL response nests assets/references under `<field>Connection.edges`
// and JSON RTE under `{ json }`; we normalize back to the flat REST-like shape
// the shared FieldRenderer consumes.

import { getConfig } from './config'
import { getRegion } from './region-server'
import { defaultLocale } from './locale'
import { ALL_FIELDS_GRAPHQL_QUERY, ALL_FIELDS_BY_URL_GRAPHQL_QUERY } from './all-fields-graphql'

function endpoint(host: string, apiKey: string, environment: string, locale: string): string {
  return `https://${host}/stacks/${apiKey}?environment=${environment}&locale=${encodeURIComponent(locale)}`
}

interface GqlResponse<T> {
  data?: T
  errors?: { message: string }[]
}

interface RawItem {
  system?: { uid?: string }
  [key: string]: unknown
}

function flattenValue(key: string, value: unknown): { key: string; value: unknown } | null {
  if (key.endsWith('Connection') && value && typeof value === 'object') {
    const base = key.slice(0, -'Connection'.length)
    const edges = (value as { edges?: { node?: unknown }[] }).edges ?? []
    const nodes = edges.map((e) => normalizeNode(e.node)).filter(Boolean)
    return { key: base, value: nodes }
  }
  if (key === 'json_rte' && value && typeof value === 'object' && 'json' in (value as object)) {
    const v = value as { json: Record<string, unknown>; embedded_itemsConnection?: { edges?: { node?: unknown }[] } }
    const doc = (v.json ?? {}) as Record<string, unknown>
    const embeds = (v.embedded_itemsConnection?.edges ?? []).map((e) => normalizeNode(e.node)).filter(Boolean)
    if (embeds.length) (doc as { _embedded_items?: unknown })._embedded_items = { json_rte: embeds }
    return { key, value: doc }
  }
  if (key === 'modular_blocks' && Array.isArray(value)) {
    return { key, value: value.map((b) => normalizeNode(b)) }
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return { key, value: normalizeNode(value) }
  }
  return { key, value }
}

function normalizeNode(node: unknown): Record<string, unknown> | unknown {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return node
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
    if (k === 'system') {
      const sys = v as Record<string, unknown>
      if (sys?.uid) out.uid = sys.uid
      if (sys?.content_type_uid) out._content_type_uid = sys.content_type_uid
      continue
    }
    const flat = flattenValue(k, v)
    if (flat) out[flat.key] = flat.value
  }
  return out
}

/** Core runner: POSTs a query (+ optional vars), returns normalized items. */
async function runQuery(
  query: string,
  variables: Record<string, unknown> | undefined,
  livePreviewHash: string | undefined,
  locale: string,
): Promise<{ items: Record<string, unknown>[]; usedPreview: boolean; errors?: string[] }> {
  const config = getConfig(await getRegion())
  // Derive GraphQL hosts; handles bare NA host (cdn.contentstack.io -> graphql.contentstack.com).
  const deliveryGqlHost = config.cdnHost.replace(/(^|-)cdn\./, '$1graphql.').replace('.contentstack.io', '.contentstack.com')
  const previewGqlHost = config.previewHost.replace(/(^|-)rest-preview\./, '$1graphql-preview.')
  const usePreview = Boolean(livePreviewHash)
  const host = usePreview ? previewGqlHost : deliveryGqlHost

  // api_key is in the URL path (/stacks/{api_key}); don't also send it as a header
  // (kept off for parity with the CSR client, where the prod GraphQL CORS policy
  // rejects the api_key header in preflight).
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    access_token: config.deliveryToken,
  }
  if (usePreview) {
    headers.preview_token = config.previewToken
    headers.live_preview = livePreviewHash as string
  }

  const res = await fetch(endpoint(host, config.apiKey, config.environment, locale), {
    method: 'POST',
    headers,
    body: JSON.stringify(variables ? { query, variables } : { query }),
    cache: 'no-store',
  })

  const json = (await res.json()) as GqlResponse<{ all_all_fields?: { items?: RawItem[] } }>
  if (json.errors?.length) {
    return { items: [], usedPreview: usePreview, errors: json.errors.map((e) => e.message) }
  }
  const items = json.data?.all_all_fields?.items ?? []
  return { items: items.map((it) => normalizeNode(it) as Record<string, unknown>), usedPreview: usePreview }
}

/** All entries via GraphQL. */
export async function fetchAllFieldsGraphql(
  livePreviewHash?: string,
  locale: string = defaultLocale,
): Promise<{ entries: Record<string, unknown>[]; usedPreview: boolean; errors?: string[] }> {
  const { items, usedPreview, errors } = await runQuery(ALL_FIELDS_GRAPHQL_QUERY, undefined, livePreviewHash, locale)
  return { entries: items, usedPreview, errors }
}

/** Single entry resolved by its `url` field, via GraphQL (where: { url }). */
export async function fetchAllFieldsByUrl(
  url: string,
  livePreviewHash?: string,
  locale: string = defaultLocale,
): Promise<{ entry: Record<string, unknown> | null; usedPreview: boolean; errors?: string[] }> {
  const { items, usedPreview, errors } = await runQuery(ALL_FIELDS_BY_URL_GRAPHQL_QUERY, { url }, livePreviewHash, locale)
  return { entry: items[0] ?? null, usedPreview, errors }
}
