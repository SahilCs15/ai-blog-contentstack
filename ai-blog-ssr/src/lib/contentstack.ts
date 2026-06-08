// Server-side Contentstack delivery client for the SSR app.
//
// Each fetch builds a Stack with live_preview enabled and applies the
// `live_preview` hash that the Live Preview SDK appends to the page URL when
// rendered inside the Visual Builder iframe. addEditableTags() decorates each
// entry with `$` edit tags so the SSR-rendered HTML carries data-cslp markers.

import contentstack, {
  Region,
  QueryOperation,
  type LivePreviewQuery,
} from '@contentstack/delivery-sdk'
import { addEditableTags } from '@contentstack/utils'
import { config } from './config'
import type { BlogPost, LandingPage, Author, Category } from './types'

function buildStack(livePreviewHash?: string) {
  const stack = contentstack.stack({
    apiKey: config.apiKey,
    deliveryToken: config.deliveryToken,
    environment: config.environment,
    region: Region.US,
    host: config.cdnHost,
    live_preview: {
      enable: true,
      preview_token: config.previewToken,
      host: config.previewHost,
    },
  })
  if (livePreviewHash) {
    stack.livePreviewQuery({ live_preview: livePreviewHash } as LivePreviewQuery)
  }
  return stack
}

const INCLUDE_POST = ['author', 'category'] as const
const INCLUDE_PAGE = ['featured_posts', 'featured_posts.author', 'featured_posts.category'] as const

function tagify<T>(entry: T, contentTypeUid: string): T {
  addEditableTags(entry as Parameters<typeof addEditableTags>[0], contentTypeUid, true, config.locale)
  return entry
}

export async function getLandingPage(lp?: string): Promise<LandingPage | null> {
  const res = await buildStack(lp)
    .contentType('page')
    .entry()
    .locale(config.locale)
    .includeReference(...INCLUDE_PAGE)
    .find<LandingPage>()
  const page = res.entries?.[0]
  return page ? tagify(page, 'page') : null
}

export async function getAllPosts(lp?: string): Promise<BlogPost[]> {
  const res = await buildStack(lp)
    .contentType('blog_post')
    .entry()
    .locale(config.locale)
    .includeReference(...INCLUDE_POST)
    .find<BlogPost>()
  return (res.entries ?? []).map((e) => tagify(e, 'blog_post'))
}

export async function getPostBySlug(slug: string, lp?: string): Promise<BlogPost | null> {
  const res = await buildStack(lp)
    .contentType('blog_post')
    .entry()
    .locale(config.locale)
    .includeReference(...INCLUDE_POST)
    .query()
    .where('slug', QueryOperation.EQUALS, slug)
    .find<BlogPost>()
  const post = res.entries?.[0]
  return post ? tagify(post, 'blog_post') : null
}

export async function getAllCategories(lp?: string): Promise<Category[]> {
  const res = await buildStack(lp).contentType('category').entry().locale(config.locale).find<Category>()
  return (res.entries ?? []).map((e) => tagify(e, 'category'))
}

export async function getAuthorByUid(uid: string, lp?: string): Promise<Author | null> {
  const author = await buildStack(lp).contentType('author').entry(uid).locale(config.locale).fetch<Author>()
  return author ? tagify(author, 'author') : null
}

// ---------------------------------------------------------------- AI hub
interface FindResult<T> {
  entries?: T[]
  count?: number
}

export async function getList<T>(
  ct: string,
  opts: { include?: string[]; limit?: number } = {},
  lp?: string
): Promise<{ items: T[]; total: number }> {
  let q: any = buildStack(lp).contentType(ct).entry().locale(config.locale).includeCount()
  if (opts.include?.length) q = q.includeReference(...opts.include)
  if (opts.limit) q = q.limit(opts.limit)
  const res = (await q.find()) as FindResult<T>
  const items = (res.entries ?? []).map((e) => tagify(e, ct))
  return { items, total: res.count ?? items.length }
}

export async function getBySlug<T>(
  ct: string,
  slug: string,
  include: string[] = [],
  lp?: string
): Promise<T | null> {
  let q: any = buildStack(lp).contentType(ct).entry().locale(config.locale)
  if (include.length) q = q.includeReference(...include)
  q = q.query().where('slug', QueryOperation.EQUALS, slug)
  const res = (await q.find()) as FindResult<T>
  const entry = res.entries?.[0]
  return entry ? tagify(entry, ct) : null
}
