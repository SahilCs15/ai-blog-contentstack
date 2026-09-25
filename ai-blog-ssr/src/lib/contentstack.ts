// Server-side Contentstack delivery client for the SSR app — MULTI-REGION.
//
// The active region is resolved per request from `getRegion()` (middleware →
// `x-region` header, from the `?region=` query param). Each fetch builds a Stack
// for that region with live_preview enabled and applies the `live_preview` hash
// the Live Preview SDK appends inside the Visual Builder iframe. addEditableTags()
// decorates each entry with `$` edit tags so the SSR HTML carries data-cslp markers.
//
// Fetch-function signatures stay region-agnostic (region is resolved inside), so
// page/components call sites are unchanged.

import contentstack, {
  Region,
  QueryOperation,
  type LivePreviewQuery,
  type ContentstackPlugin,
} from '@contentstack/delivery-sdk'
import { addEditableTags } from '@contentstack/utils'
import { getConfig } from './config'
import { getRegion } from './region-server'
import { defaultLocale } from './locale'
import { toCsError, asThrowable } from './cs-error'
import type { BlogPost, LandingPage, Author, Category, ShoeLanding } from './types'

/** Context attached to every error so the on-page error card shows where it failed. */
function ctx(region: string, extra: Record<string, string | undefined> = {}): Record<string, string | undefined> {
  const config = getConfig(region)
  return {
    region,
    environment: config.environment || '(missing)',
    cdnHost: config.cdnHost || '(missing)',
    previewHost: config.previewHost || '(missing)',
    locale: extra.locale ?? defaultLocale,
    apiKey: config.apiKey ? config.apiKey.slice(0, 10) + '…' : '(missing — region not configured)',
    deliveryToken: config.deliveryToken ? 'set' : '(missing — set CS_DELIVERY_TOKEN_<REGION>)',
    ...extra,
  }
}

// A bare hostname (cdn.contentstack.io, dev11-cdn.csnonprod.com) goes through
// the SDK's host builder, which forms `https://<host>:443/v3`. A self-hosted
// host that already carries a port and/or path (localhost:8081/api) can't: the
// builder would inject the port mid-string → `https://localhost:8081/api:443/v3`
// (404). For those, pass a full `endpoint` (baseURL) so the builder is bypassed.
// The preview host is applied separately (string-concatenated), so it is
// unaffected either way.
function cdnHostConfig(cdnHost: string): { host: string } | { endpoint: string } {
  return /[:/]/.test(cdnHost) ? { endpoint: `https://${cdnHost}/v3` } : { host: cdnHost }
}

/**
 * Ask the Preview Service to serve auto-draft content.
 *
 * Its draft interceptor decides per request:
 *   isDraftEligibleTracker = header === 'true' || ctx.type === TrackerTypes.livePreview
 * Visual Builder is its own tracker type, so it is NOT draft-eligible by default
 * and the canvas silently renders published content. This header is the opt-in
 * for any tracker, and only goes out when a preview hash is in play.
 */
const DRAFT_PREVIEW_HEADER = 'x-cs-preview-enable-entry-draft'

class DraftPreviewPlugin implements ContentstackPlugin {
  onRequest(reqConfig: any): any {
    const target = [reqConfig?.baseURL, reqConfig?.url, reqConfig?.host].filter(Boolean).join(' ')
    const params = reqConfig?.params ?? {}
    if (!/preview/i.test(target) && !params.live_preview) return reqConfig
    return { ...reqConfig, headers: { ...(reqConfig?.headers ?? {}), [DRAFT_PREVIEW_HEADER]: 'true' } }
  }
  onResponse(_request: any, response: any, _data: any): any {
    return response
  }
}

function buildStack(region: string, livePreviewHash?: string) {
  const config = getConfig(region)
  const stack = contentstack.stack({
    apiKey: config.apiKey,
    deliveryToken: config.deliveryToken,
    environment: config.environment,
    region: Region.US,
    ...cdnHostConfig(config.cdnHost),
    live_preview: {
      enable: true,
      preview_token: config.previewToken,
      host: config.previewHost,
    },
    plugins: [new DraftPreviewPlugin()],
  })
  if (livePreviewHash) {
    stack.livePreviewQuery({ live_preview: livePreviewHash } as LivePreviewQuery)
  }
  return stack
}

const INCLUDE_POST = ['author', 'category'] as const
const INCLUDE_PAGE = ['featured_posts', 'featured_posts.author', 'featured_posts.category'] as const

function tagify<T>(entry: T, contentTypeUid: string, locale: string): T {
  // The locale must match the entry's locale so the data-cslp edit tags point
  // the Visual Builder at the correct locale variant of each field.
  addEditableTags(entry as Parameters<typeof addEditableTags>[0], contentTypeUid, true, locale)
  return entry
}

// A self-hosted delivery API may not support include[] (reference resolution):
// it rejects any include with error 141 ("is not a valid reference"). When that
// happens, retry the same query once with includes off — references then stay
// as { uid, _content_type_uid } pointers, which the renderers already tolerate.
// Real clusters resolve includes, so the retry never fires there.
function isIncludeUnsupported(e: unknown): boolean {
  return (e as { error_code?: number } | null)?.error_code === 141
}

async function withIncludeFallback<T>(run: (includes: boolean) => Promise<T>): Promise<T> {
  try {
    return await run(true)
  } catch (e) {
    if (isIncludeUnsupported(e)) return run(false)
    throw e
  }
}

export async function getLandingPage(lp?: string, locale: string = defaultLocale): Promise<LandingPage | null> {
  const region = await getRegion()
  try {
    const stack = buildStack(region, lp)
    const res = await withIncludeFallback<{ entries?: LandingPage[] }>((inc) => {
      let q: any = stack.contentType('page').entry().locale(locale)
      if (inc) q = q.includeReference(...INCLUDE_PAGE)
      return q.find()
    })
    const page = res.entries?.[0]
    return page ? tagify(page, 'page', locale) : null
  } catch (e) {
    throw asThrowable(toCsError(e, ctx(region, { contentType: 'page', operation: 'get landing page', locale })))
  }
}

const INCLUDE_SHOE_LANDING = [
  'featured_shoes',
  'related_products',
  'spotlight_shoe',
  'store_info.staff_pick',
  'sections.nested_showcase.linked_shoe',
  'sections.nested_showcase.linked_reads',
] as const

/**
 * The preview API returns `null` for every file field, so nothing inside Visual Builder
 * renders an image. Refetch without the preview hash and copy the asset values back in
 * wherever preview left a hole. Image edits therefore preview as the published asset,
 * which is the trade for having any image at all.
 */
export async function getShoeLanding(lp?: string, locale: string = defaultLocale): Promise<ShoeLanding | null> {
  const region = await getRegion()
  try {
    const stack = buildStack(region, lp)
    const res = await withIncludeFallback<{ entries?: ShoeLanding[] }>((inc) => {
      let q: any = stack.contentType('shoe_landing').entry().locale(locale)
      if (inc) q = q.includeReference(...INCLUDE_SHOE_LANDING)
      // Cache-version param: bump when the shoe content changes so the delivery CDN
      // serves a fresh response instead of a long-lived stale cache of this query URL.
      q = q.addParams({ _cv: '4' })
      return q.find()
    })
    const page = res.entries?.[0]
    return page ? tagify(page, 'shoe_landing', locale) : null
  } catch (e) {
    throw asThrowable(toCsError(e, ctx(region, { contentType: 'shoe_landing', operation: 'get shoe landing', locale })))
  }
}

export async function getAllPosts(lp?: string, locale: string = defaultLocale): Promise<BlogPost[]> {
  const region = await getRegion()
  try {
    const stack = buildStack(region, lp)
    const res = await withIncludeFallback<{ entries?: BlogPost[] }>((inc) => {
      let q: any = stack.contentType('blog_post').entry().locale(locale)
      if (inc) q = q.includeReference(...INCLUDE_POST)
      return q.find()
    })
    return (res.entries ?? []).map((e) => tagify(e, 'blog_post', locale))
  } catch (e) {
    throw asThrowable(toCsError(e, ctx(region, { contentType: 'blog_post', operation: 'list posts', locale })))
  }
}

export async function getPostBySlug(slug: string, lp?: string, locale: string = defaultLocale): Promise<BlogPost | null> {
  const region = await getRegion()
  const stack = buildStack(region, lp)
  const res = await withIncludeFallback<{ entries?: BlogPost[] }>((inc) => {
    let q: any = stack.contentType('blog_post').entry().locale(locale)
    if (inc) q = q.includeReference(...INCLUDE_POST)
    return q.query().where('slug', QueryOperation.EQUALS, slug).find()
  })
  const post = res.entries?.[0]
  return post ? tagify(post, 'blog_post', locale) : null
}

export async function getAllCategories(lp?: string, locale: string = defaultLocale): Promise<Category[]> {
  const region = await getRegion()
  const res = await buildStack(region, lp).contentType('category').entry().locale(locale).find<Category>()
  return (res.entries ?? []).map((e) => tagify(e, 'category', locale))
}

export async function getAuthorByUid(uid: string, lp?: string, locale: string = defaultLocale): Promise<Author | null> {
  const region = await getRegion()
  const author = await buildStack(region, lp).contentType('author').entry(uid).locale(locale).fetch<Author>()
  return author ? tagify(author, 'author', locale) : null
}

// ---------------------------------------------------------------- AI hub
interface FindResult<T> {
  entries?: T[]
  count?: number
}

export async function getList<T>(
  ct: string,
  opts: { include?: string[]; limit?: number } = {},
  lp?: string,
  locale: string = defaultLocale
): Promise<{ items: T[]; total: number }> {
  const region = await getRegion()
  try {
    const stack = buildStack(region, lp)
    const res = (await withIncludeFallback((inc) => {
      let q: any = stack.contentType(ct).entry().locale(locale).includeCount()
      if (inc && opts.include?.length) q = q.includeReference(...opts.include)
      if (opts.limit) q = q.limit(opts.limit)
      return q.find()
    })) as FindResult<T>
    const items = (res.entries ?? []).map((e) => tagify(e, ct, locale))
    return { items, total: res.count ?? items.length }
  } catch (e) {
    throw asThrowable(toCsError(e, ctx(region, { contentType: ct, operation: "list entries", locale })))
  }
}

// Content types whose nav links / home sections show only when the active region
// has entries for them (so empty stacks don't surface dead pages).
export const NAV_CONTENT_TYPES = [
  'ai_tool', 'ai_model', 'ai_company', 'ai_news', 'ai_category',
  'tutorial', 'glossary_term', 'use_case', 'comparison', 'industry_report',
  'blog_post', 'all_fields',
] as const

const availabilityCache = new Map<string, Promise<string[]>>()

/** Content types (from NAV_CONTENT_TYPES) that have ≥1 entry in the active region+locale. Cached per region+locale. */
export async function getAvailableContentTypes(locale: string = defaultLocale): Promise<string[]> {
  const region = await getRegion()
  const key = `${region}:${locale}`
  const cached = availabilityCache.get(key)
  if (cached) return cached
  const stack = buildStack(region)
  const p = Promise.all(
    NAV_CONTENT_TYPES.map(async (ct) => {
      try {
        const res = (await stack.contentType(ct).entry().locale(locale).includeCount().limit(1).find()) as FindResult<unknown>
        return (res.count ?? 0) > 0 ? ct : null
      } catch {
        return null
      }
    }),
  ).then((r) => r.filter(Boolean) as string[])
  availabilityCache.set(key, p)
  return p
}

// `reference_field` is the only true reference (group/global are embedded
// inline and must NOT be passed to includeReference). The extra paths resolve
// the references *inside* a referenced blog_post — i.e. deep/nested references.
const ALL_FIELDS_INCLUDE = [
  'reference_field',
  'reference_field.author',
  'reference_field.category',
] as const

type Stack = ReturnType<typeof buildStack>

/**
 * Walk a JSON RTE field for embedded entry/asset nodes and resolve each by uid,
 * attaching the resolved objects as `doc._embedded_items` (keyed by path). On
 * this stack the delivery API does not auto-populate `_embedded_items`, so we
 * resolve from the node `attrs` ourselves. Mutates the entry in place.
 */
async function resolveJsonRteEmbeds(entry: Record<string, unknown>, stack: Stack, locale: string): Promise<void> {
  const doc = entry.json_rte as { children?: unknown[]; _embedded_items?: Record<string, unknown[]> } | undefined
  if (!doc || typeof doc !== 'object') return

  const nodes: Record<string, string>[] = []
  const walk = (n: unknown) => {
    if (!n || typeof n !== 'object') return
    if (Array.isArray(n)) return n.forEach(walk)
    const node = n as { type?: string; attrs?: Record<string, string>; children?: unknown[] }
    if (node.type === 'reference' && node.attrs?.type) nodes.push(node.attrs)
    if (node.children) walk(node.children)
  }
  walk(doc.children)
  if (!nodes.length) return

  const resolved = await Promise.all(
    nodes.map(async (a) => {
      try {
        if (a.type === 'asset' && a['asset-uid']) {
          // asset embeds already carry asset-link/name/type in the node attrs
          return { uid: a['asset-uid'], _content_type_uid: 'sys_assets', title: a['asset-name'], url: a['asset-link'], filename: a['asset-name'], content_type: a['asset-type'] }
        }
        if (a.type === 'entry' && a['entry-uid'] && a['content-type-uid']) {
          const e = await stack.contentType(a['content-type-uid']).entry(a['entry-uid']).locale(locale).fetch<Record<string, unknown>>()
          return e ? { ...e, _content_type_uid: a['content-type-uid'] } : null
        }
      } catch {
        /* skip unresolvable embed */
      }
      return null
    }),
  )
  doc._embedded_items = { json_rte: resolved.filter(Boolean) as unknown[] }
}

/**
 * Fetch all "all fields" test entries server-side, references resolved.
 * `lp` is the live_preview hash from the page URL (Visual Builder) → draft data.
 */
export async function getAllFieldsEntries(
  lp?: string,
  ct = 'all_fields',
  locale: string = defaultLocale,
  url = '/all-fields' // the /all-fields page renders only this entry; the /graphql entry has its own page
): Promise<Record<string, unknown>[]> {
  const region = await getRegion()
  try {
    const stack = buildStack(region, lp)
    const res = await withIncludeFallback<{ entries?: Record<string, unknown>[] }>((inc) => {
      let q: any = stack.contentType(ct).entry().locale(locale)
      if (inc) q = q.includeReference(...ALL_FIELDS_INCLUDE)
      return q.query().where('url', QueryOperation.EQUALS, url).find()
    })
    const entries = (res.entries ?? []).map((e) => tagify(e, ct, locale))
    await Promise.all(entries.map((e) => resolveJsonRteEmbeds(e, stack, locale)))
    return entries
  } catch (e) {
    throw asThrowable(toCsError(e, ctx(region, { contentType: ct, operation: 'get all-fields entries', locale })))
  }
}

export async function getBySlug<T>(
  ct: string,
  slug: string,
  include: string[] = [],
  lp?: string,
  locale: string = defaultLocale
): Promise<T | null> {
  const region = await getRegion()
  try {
    const stack = buildStack(region, lp)
    const res = (await withIncludeFallback((inc) => {
      let q: any = stack.contentType(ct).entry().locale(locale)
      if (inc && include.length) q = q.includeReference(...include)
      return q.query().where('slug', QueryOperation.EQUALS, slug).find()
    })) as FindResult<T>
    const entry = res.entries?.[0]
    return entry ? tagify(entry, ct, locale) : null
  } catch (e) {
    throw asThrowable(toCsError(e, ctx(region, { contentType: ct, slug, operation: "get entry by slug", locale })))
  }
}
