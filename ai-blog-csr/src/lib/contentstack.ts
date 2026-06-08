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
import { toCsError } from './cs-error'
import type { BlogPost, LandingPage, Author, Category } from './types'

/** Context attached to every error so the on-page error card shows where it failed. */
function ctx(extra: Record<string, string | undefined> = {}): Record<string, string | undefined> {
  return {
    environment: config.environment || '(missing)',
    cdnHost: config.cdnHost || '(missing)',
    previewHost: config.previewHost || '(missing)',
    locale: config.locale,
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

/** Apply the current live-preview hash (set by LP after init) to a query. */
function withLivePreview(query: { livePreviewQuery: (q: LivePreviewQuery) => void }) {
  const hash = (ContentstackLivePreview as unknown as { hash?: string }).hash
  if (hash) {
    query.livePreviewQuery({ live_preview: hash } as LivePreviewQuery)
  }
  return query
}

const INCLUDE_POST = ['author', 'category'] as const
const INCLUDE_PAGE = [
  'featured_posts',
  'featured_posts.author',
  'featured_posts.category',
] as const

function tagify<T>(entry: T, contentTypeUid: string): T {
  // addEditableTags mutates the entry in place, adding `$` edit-tag metadata.
  addEditableTags(entry as Parameters<typeof addEditableTags>[0], contentTypeUid, true, config.locale)
  return entry
}

export async function getLandingPage(): Promise<LandingPage | null> {
  try {
    const q = stack
      .contentType('page')
      .entry()
      .locale(config.locale)
      .includeReference(...INCLUDE_PAGE)
    withLivePreview(q as never)
    const res = await q.find<LandingPage>()
    const page = res.entries?.[0]
    if (!page) return null
    return tagify(page, 'page')
  } catch (e) {
    throw toCsError(e, ctx({ contentType: 'page', operation: 'get landing page' }))
  }
}

export async function getAllPosts(): Promise<BlogPost[]> {
  try {
    const q = stack
      .contentType('blog_post')
      .entry()
      .locale(config.locale)
      .includeReference(...INCLUDE_POST)
    withLivePreview(q as never)
    const res = await q.find<BlogPost>()
    return (res.entries ?? []).map((e) => tagify(e, 'blog_post'))
  } catch (e) {
    throw toCsError(e, ctx({ contentType: 'blog_post', operation: 'list posts' }))
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const q = stack
      .contentType('blog_post')
      .entry()
      .locale(config.locale)
      .includeReference(...INCLUDE_POST)
      .query()
      .where('slug', QueryOperation.EQUALS, slug)
    withLivePreview(q as never)
    const res = await q.find<BlogPost>()
    const post = res.entries?.[0]
    if (!post) return null
    return tagify(post, 'blog_post')
  } catch (e) {
    throw toCsError(e, ctx({ contentType: 'blog_post', slug, operation: 'get post by slug' }))
  }
}

export async function getPostByUid(uid: string): Promise<BlogPost | null> {
  const q = stack
    .contentType('blog_post')
    .entry(uid)
    .locale(config.locale)
    .includeReference(...INCLUDE_POST)
  withLivePreview(q as never)
  const post = await q.fetch<BlogPost>()
  if (!post) return null
  return tagify(post, 'blog_post')
}

export async function getAllCategories(): Promise<Category[]> {
  const q = stack.contentType('category').entry().locale(config.locale)
  withLivePreview(q as never)
  const res = await q.find<Category>()
  return (res.entries ?? []).map((e) => tagify(e, 'category'))
}

export async function getAuthorByUid(uid: string): Promise<Author | null> {
  const q = stack.contentType('author').entry(uid).locale(config.locale)
  withLivePreview(q as never)
  const author = await q.fetch<Author>()
  if (!author) return null
  return tagify(author, 'author')
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

export async function getList<T>(ct: string, opts: ListOpts = {}): Promise<{ items: T[]; total: number }> {
  try {
    let q: any = stack.contentType(ct).entry().locale(config.locale).includeCount()
    if (opts.include?.length) q = q.includeReference(...opts.include)
    if (opts.limit) q = q.limit(opts.limit)
    if (opts.skip) q = q.skip(opts.skip)
    withLivePreview(q)
    const res = (await q.find()) as FindResult<T>
    const items = (res.entries ?? []).map((e) => tagify(e, ct))
    return { items, total: res.count ?? items.length }
  } catch (e) {
    throw toCsError(e, ctx({ contentType: ct, operation: 'list entries' }))
  }
}

export async function getBySlug<T>(ct: string, slug: string, include: string[] = []): Promise<T | null> {
  try {
    let q: any = stack
      .contentType(ct)
      .entry()
      .locale(config.locale)
    if (include.length) q = q.includeReference(...include)
    q = q.query().where('slug', QueryOperation.EQUALS, slug)
    withLivePreview(q)
    const res = (await q.find()) as FindResult<T>
    const entry = res.entries?.[0]
    return entry ? tagify(entry, ct) : null
  } catch (e) {
    throw toCsError(e, ctx({ contentType: ct, slug, operation: 'get entry by slug' }))
  }
}
