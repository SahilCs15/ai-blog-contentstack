// Contentstack delivery + live-preview client for the CSR app.
//
// One shared Stack instance is created with live_preview enabled. In the
// browser, ContentstackLivePreview.init({ ssr: false }) takes over: it injects
// the live_preview hash on every query and re-renders via an onEntryChange
// callback whenever an editor changes a field in the Visual Builder.

import contentstack, { Region, QueryOperation, type LivePreviewQuery } from '@contentstack/delivery-sdk'
import ContentstackLivePreview, { type IStackSdk } from '@contentstack/live-preview-utils'
import { addEditableTags } from '@contentstack/utils'
import { config } from './config'
import { resolveLocale } from './locale'
import { toCsError } from './cs-error'
import type { BlogPost, LandingPage, Author, Category } from './types'

/** Context attached to every error so the on-page error card shows where it failed. */
function ctx(extra: Record<string, string | undefined> = {}): Record<string, string | undefined> {
  return {
    environment: config.environment || '(missing)',
    cdnHost: config.cdnHost || '(missing)',
    previewHost: config.previewHost || '(missing)',
    locale: extra.locale ?? resolveLocale(),
    apiKey: config.apiKey ? config.apiKey.slice(0, 10) + '…' : '(missing — set VITE_CS_API_KEY)',
    deliveryToken: config.deliveryToken ? 'set' : '(missing — set VITE_CS_DELIVERY_TOKEN)',
    ...extra,
  }
}

export const stack = contentstack.stack({
  apiKey: config.apiKey,
  deliveryToken: config.deliveryToken,
  environment: config.environment,
  region: Region.US, // host overrides below point it at dev23/csnonprod
  host: config.cdnHost,
  live_preview: {
    enable: true,
    preview_token: config.previewToken,
    host: config.previewHost,
  },
})

let lpReady = false

/**
 * Initialize Live Preview ONCE at app startup, before any page fetch. This is
 * critical: the LP SDK must be initialized before the first query so that
 * queries made inside the Visual Builder iframe carry the live_preview hash.
 * Calling this after the first fetch (the previous bug) meant the initial
 * in-iframe load ran without a hash and showed no preview data.
 */
export function initLivePreviewOnce(): void {
  if (lpReady) return
  lpReady = true
  ContentstackLivePreview.init({
    ssr: false,
    enable: true,
    mode: 'builder',
    stackSdk: stack.config as IStackSdk,
    stackDetails: {
      apiKey: config.apiKey,
      environment: config.environment,
    },
    clientUrlParams: {
      host: config.appHost,
    },
    editButton: { enable: true },
  })
}

/**
 * Subscribe to entry changes. The SDK invokes the callback once right after
 * registration (driving the initial hash-aware load) and again on every edit.
 * Returns an unsubscribe function.
 */
export function onLivePreviewChange(onChange: () => void): () => void {
  const token = ContentstackLivePreview.onEntryChange(onChange) as unknown as number | undefined
  return () => {
    try {
      ;(ContentstackLivePreview as unknown as { unsubscribeOnEntryChange?: (t: unknown) => void })
        .unsubscribeOnEntryChange?.(token)
    } catch {
      /* no-op */
    }
  }
}

/**
 * Apply the current live-preview hash (set by LP after init) to the shared
 * Stack. `livePreviewQuery` is a Stack method — not a query/entry method — so
 * it must be called on `stack` before building the query, otherwise the SDK
 * throws "livePreviewQuery is not a function". The hash is global to the Stack,
 * so applying it once per fetch correctly scopes the next query to the preview.
 */
function applyLivePreview() {
  const hash = (ContentstackLivePreview as unknown as { hash?: string }).hash
  stack.livePreviewQuery({ live_preview: hash ?? '' } as LivePreviewQuery)
}

/** Current live-preview hash, if the SDK has one (only inside Visual Builder). */
export function livePreviewHash(): string | undefined {
  const hash = (ContentstackLivePreview as unknown as { hash?: string }).hash
  return hash || undefined
}

const INCLUDE_POST = ['author', 'category'] as const
const INCLUDE_PAGE = [
  'featured_posts',
  'featured_posts.author',
  'featured_posts.category',
] as const

function tagify<T>(entry: T, contentTypeUid: string, locale: string): T {
  // addEditableTags mutates the entry in place, adding `$` edit-tag metadata.
  // The locale must match the entry's locale so the data-cslp tags point the
  // Visual Builder at the correct locale variant of each field.
  addEditableTags(entry as Parameters<typeof addEditableTags>[0], contentTypeUid, true, locale)
  return entry
}

export async function getLandingPage(locale: string = resolveLocale()): Promise<LandingPage | null> {
  try {
    applyLivePreview()
    const q = stack
      .contentType('page')
      .entry()
      .locale(locale)
      .includeReference(...INCLUDE_PAGE)
    const res = await q.find<LandingPage>()
    const page = res.entries?.[0]
    if (!page) return null
    return tagify(page, 'page', locale)
  } catch (e) {
    throw toCsError(e, ctx({ contentType: 'page', operation: 'get landing page', locale }))
  }
}

export async function getAllPosts(locale: string = resolveLocale()): Promise<BlogPost[]> {
  try {
    applyLivePreview()
    const q = stack
      .contentType('blog_post')
      .entry()
      .locale(locale)
      .includeReference(...INCLUDE_POST)
    const res = await q.find<BlogPost>()
    return (res.entries ?? []).map((e) => tagify(e, 'blog_post', locale))
  } catch (e) {
    throw toCsError(e, ctx({ contentType: 'blog_post', operation: 'list posts', locale }))
  }
}

export async function getPostBySlug(slug: string, locale: string = resolveLocale()): Promise<BlogPost | null> {
  try {
    applyLivePreview()
    const q = stack
      .contentType('blog_post')
      .entry()
      .locale(locale)
      .includeReference(...INCLUDE_POST)
      .query()
      .where('slug', QueryOperation.EQUALS, slug)
    const res = await q.find<BlogPost>()
    const post = res.entries?.[0]
    if (!post) return null
    return tagify(post, 'blog_post', locale)
  } catch (e) {
    throw toCsError(e, ctx({ contentType: 'blog_post', slug, operation: 'get post by slug', locale }))
  }
}

export async function getPostByUid(uid: string, locale: string = resolveLocale()): Promise<BlogPost | null> {
  applyLivePreview()
  const q = stack
    .contentType('blog_post')
    .entry(uid)
    .locale(locale)
    .includeReference(...INCLUDE_POST)
  const post = await q.fetch<BlogPost>()
  if (!post) return null
  return tagify(post, 'blog_post', locale)
}

export async function getAllCategories(locale: string = resolveLocale()): Promise<Category[]> {
  applyLivePreview()
  const q = stack.contentType('category').entry().locale(locale)
  const res = await q.find<Category>()
  return (res.entries ?? []).map((e) => tagify(e, 'category', locale))
}

export async function getAuthorByUid(uid: string, locale: string = resolveLocale()): Promise<Author | null> {
  applyLivePreview()
  const q = stack.contentType('author').entry(uid).locale(locale)
  const author = await q.fetch<Author>()
  if (!author) return null
  return tagify(author, 'author', locale)
}

// ---------------------------------------------------------------- AI hub
// Generic helpers reused by tools, companies, models, news, tutorials,
// glossary, use cases, comparisons, and reports.

interface ListOpts {
  include?: string[]
  limit?: number
  skip?: number
}

interface FindResult<T> {
  entries?: T[]
  count?: number
}

export async function getList<T>(
  ct: string,
  opts: ListOpts = {},
  locale: string = resolveLocale(),
): Promise<{ items: T[]; total: number }> {
  try {
    applyLivePreview()
    let q: any = stack.contentType(ct).entry().locale(locale).includeCount()
    if (opts.include?.length) q = q.includeReference(...opts.include)
    if (opts.limit) q = q.limit(opts.limit)
    if (opts.skip) q = q.skip(opts.skip)
    const res = (await q.find()) as FindResult<T>
    const items = (res.entries ?? []).map((e) => tagify(e, ct, locale))
    return { items, total: res.count ?? items.length }
  } catch (e) {
    throw toCsError(e, ctx({ contentType: ct, operation: 'list entries', locale }))
  }
}

// Content types whose nav links / home sections are shown only when the active
// region actually has entries for them (so empty stacks don't show dead pages).
export const NAV_CONTENT_TYPES = [
  'ai_tool', 'ai_model', 'ai_company', 'ai_news', 'ai_category',
  'tutorial', 'glossary_term', 'use_case', 'comparison', 'industry_report',
  'blog_post', 'all_fields',
] as const

const availabilityCache = new Map<string, Promise<Set<string>>>()

/**
 * Returns the set of NAV_CONTENT_TYPES that have at least one entry in the
 * active region + locale. Cached per locale (region is fixed per load). Used to
 * hide nav links and home sections for content types with no data.
 */
export function getAvailableContentTypes(locale: string = resolveLocale()): Promise<Set<string>> {
  const cached = availabilityCache.get(locale)
  if (cached) return cached
  const p = (async () => {
    const results = await Promise.all(
      NAV_CONTENT_TYPES.map(async (ct) => {
        try {
          const res = (await stack.contentType(ct).entry().locale(locale).includeCount().limit(1).find()) as FindResult<unknown>
          return (res.count ?? (res.entries?.length ?? 0)) > 0 ? ct : null
        } catch {
          return null
        }
      }),
    )
    return new Set(results.filter(Boolean) as string[])
  })()
  availabilityCache.set(locale, p)
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

/**
 * Walk a JSON RTE field for embedded entry/asset nodes and resolve each by uid,
 * attaching them as `doc._embedded_items`. The delivery API does not auto-fill
 * `_embedded_items` on this stack, so we resolve from the node attrs. Mutates
 * the entry in place.
 */
async function resolveJsonRteEmbeds(entry: Record<string, unknown>, locale: string): Promise<void> {
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
 * Fetch all "all fields" test entries with references + JSON-RTE embeds resolved.
 * Used by the /all-fields page; the renderer infers field kinds from the shape.
 */
export async function getAllFieldsEntries(
  ct = 'all_fields',
  locale: string = resolveLocale(),
  url = '/all-fields', // the /all-fields page renders only this entry; the /graphql entry has its own page
): Promise<Record<string, unknown>[]> {
  try {
    applyLivePreview()
    const res = await stack
      .contentType(ct)
      .entry()
      .locale(locale)
      .includeReference(...ALL_FIELDS_INCLUDE)
      .query()
      .where('url', QueryOperation.EQUALS, url)
      .find<Record<string, unknown>>()
    const entries = (res.entries ?? []).map((e) => tagify(e, ct, locale))
    await Promise.all(entries.map((e) => resolveJsonRteEmbeds(e, locale)))
    return entries
  } catch (e) {
    throw toCsError(e, ctx({ contentType: ct, operation: 'get all-fields entries', locale }))
  }
}

export async function getBySlug<T>(
  ct: string,
  slug: string,
  include: string[] = [],
  locale: string = resolveLocale(),
): Promise<T | null> {
  try {
    applyLivePreview()
    let q: any = stack
      .contentType(ct)
      .entry()
      .locale(locale)
    if (include.length) q = q.includeReference(...include)
    q = q.query().where('slug', QueryOperation.EQUALS, slug)
    const res = (await q.find()) as FindResult<T>
    const entry = res.entries?.[0]
    return entry ? tagify(entry, ct, locale) : null
  } catch (e) {
    throw toCsError(e, ctx({ contentType: ct, slug, operation: 'get entry by slug', locale }))
  }
}
