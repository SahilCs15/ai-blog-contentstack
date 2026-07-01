// GraphQL Preview client for the /graphql page (client-side).
//
// Two hosts, same as REST: the delivery GraphQL host serves published content;
// the preview GraphQL host serves draft content but REQUIRES a live_preview
// hash (sent as a header) — which only exists inside the Visual Builder. So:
//   - hash present  -> preview host + `live_preview` header (draft content)
//   - no hash       -> delivery host (published content)
//
// The GraphQL response shape differs from REST (assets live under
// `<field>Connection.edges.node`, references under
// `reference_fieldConnection.edges.node`, JSON RTE under `{ json }`). We
// normalize it back to a flat entry so the same FieldRenderer can consume it.

import { config } from './config'
import { resolveLocale } from './locale'
import { ALL_FIELDS_GRAPHQL_QUERY, ALL_FIELDS_BY_URL_GRAPHQL_QUERY } from './all-fields-graphql'

// Derive the GraphQL hosts from the CDA/preview hosts. Handles every cluster:
//   dev11-cdn.csnonprod.com  -> dev11-graphql.csnonprod.com
//   eu-cdn.contentstack.com  -> eu-graphql.contentstack.com
//   cdn.contentstack.io (NA) -> graphql.contentstack.com  (bare host; GraphQL is .com not .io)
const DELIVERY_GQL_HOST = config.cdnHost.replace(/(^|-)cdn\./, '$1graphql.').replace('.contentstack.io', '.contentstack.com')
const PREVIEW_GQL_HOST = config.previewHost.replace(/(^|-)rest-preview\./, '$1graphql-preview.')

function endpoint(host: string, locale: string): string {
  return `https://${host}/stacks/${config.apiKey}?environment=${config.environment}&locale=${encodeURIComponent(locale)}`
}

interface GqlResponse<T> {
  data?: T
  errors?: { message: string }[]
}

interface RawItem {
  system?: { uid?: string }
  [key: string]: unknown
}

/** Flatten one GraphQL field value into the REST-like shape the renderer expects. */
function flattenValue(key: string, value: unknown): { key: string; value: unknown } | null {
  // <field>Connection { edges { node {...} } }  -> assets or references
  if (key.endsWith('Connection') && value && typeof value === 'object') {
    const base = key.slice(0, -'Connection'.length)
    const edges = (value as { edges?: { node?: unknown }[] }).edges ?? []
    const nodes = edges.map((e) => normalizeNode(e.node)).filter(Boolean)
    return { key: base, value: nodes }
  }
  // JSON RTE comes back as { json: <doc>, embedded_itemsConnection: {...} }.
  // Return the doc with resolved embeds attached as `_embedded_items` so the
  // renderer treats it the same as the REST shape.
  if (key === 'json_rte' && value && typeof value === 'object' && 'json' in (value as object)) {
    const v = value as { json: Record<string, unknown>; embedded_itemsConnection?: { edges?: { node?: unknown }[] } }
    const doc = (v.json ?? {}) as Record<string, unknown>
    const embeds = (v.embedded_itemsConnection?.edges ?? []).map((e) => normalizeNode(e.node)).filter(Boolean)
    if (embeds.length) (doc as { _embedded_items?: unknown })._embedded_items = { json_rte: embeds }
    return { key, value: doc }
  }
  // modular blocks: array of single-key objects, recurse into the inner block
  if (key === 'modular_blocks' && Array.isArray(value)) {
    return { key, value: value.map((b) => normalizeNode(b)) }
  }
  // nested object (group / global field / block inner) -> normalize recursively
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return { key, value: normalizeNode(value) }
  }
  return { key, value }
}

/** Recursively normalize a GraphQL node into the flat REST-like shape. */
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

/**
 * Run the generated all-fields query against the GraphQL Preview API.
 * `livePreviewHash` (from the LP SDK) switches to the preview host + draft data.
 */
/** Core runner: POSTs a query (+ optional vars), returns normalized items. */
async function runQuery(
  query: string,
  variables: Record<string, unknown> | undefined,
  livePreviewHash: string | undefined,
  locale: string,
): Promise<{ items: Record<string, unknown>[]; usedPreview: boolean; errors?: string[] }> {
  const usePreview = Boolean(livePreviewHash)
  const host = usePreview ? PREVIEW_GQL_HOST : DELIVERY_GQL_HOST

  // NOTE: the api_key is in the URL path (/stacks/{api_key}); do NOT also send it
  // as a header — the prod GraphQL CORS policy rejects the api_key header in the
  // browser preflight ("not allowed by Access-Control-Allow-Headers").
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    access_token: config.deliveryToken,
  }
  if (usePreview) {
    headers.preview_token = config.previewToken
    headers.live_preview = livePreviewHash as string
  }

  const res = await fetch(endpoint(host, locale), {
    method: 'POST',
    headers,
    body: JSON.stringify(variables ? { query, variables } : { query }),
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
  locale: string = resolveLocale(),
): Promise<{ entries: Record<string, unknown>[]; usedPreview: boolean; errors?: string[] }> {
  const { items, usedPreview, errors } = await runQuery(ALL_FIELDS_GRAPHQL_QUERY, undefined, livePreviewHash, locale)
  return { entries: items, usedPreview, errors }
}

/** Single entry resolved by its `url` field, via GraphQL (where: { url }). */
export async function fetchAllFieldsByUrl(
  url: string,
  livePreviewHash?: string,
  locale: string = resolveLocale(),
): Promise<{ entry: Record<string, unknown> | null; usedPreview: boolean; errors?: string[] }> {
  const { items, usedPreview, errors } = await runQuery(ALL_FIELDS_BY_URL_GRAPHQL_QUERY, { url }, livePreviewHash, locale)
  return { entry: items[0] ?? null, usedPreview, errors }
}
