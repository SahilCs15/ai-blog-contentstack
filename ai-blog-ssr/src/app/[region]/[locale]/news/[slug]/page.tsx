import Link from '@/components/LocaleLink'
import { getBySlug } from '@/lib/contentstack'
import type { AiNews } from '@/lib/hub-types'
import { edit } from '@/lib/cslp'
import { imageUrl, formatDate } from '@/lib/format'
import { Rte } from '@/lib/rte'
import { resolveLocale } from '@/lib/locale'
import { Empty } from '@/components/States'
export const dynamic = 'force-dynamic'
type Props = { params: Promise<{ region: string; slug: string; locale: string }>; searchParams: Promise<{ live_preview?: string; locale?: string }> }
export default async function NewsArticlePage({ params, searchParams }: Props) {
  const { slug, locale: pathLocale } = await params; const { live_preview, locale: searchLocale } = await searchParams
  const locale = resolveLocale(pathLocale, searchLocale)
  const a = await getBySlug<AiNews>('ai_news', slug, ['related_companies', 'category'], live_preview, locale)
  if (!a) return <Empty title="Article not found" />
  return (
    <article className="article">
      <Link href="/news" className="backlink">← All news</Link>
      <h1 className="article__title" {...edit(a.$, 'title')}>{a.title}</h1>
      <div className="byline"><div>{a.author && <div className="byline__name">{a.author}</div>}{a.published_date && <div className="byline__meta">{formatDate(a.published_date)}</div>}</div></div>
      {a.featured_image?.url && <div className="article__hero"><img src={imageUrl(a.featured_image.url, 1400)} alt={a.title} {...edit(a.featured_image.$, 'url')} /></div>}
      <div className="article__body prose">{a.body ? <Rte doc={a.body} /> : null}</div>
      {a.topics?.length ? <div className="tags">{a.topics.map((t) => <span className="tag" key={t}>#{t}</span>)}</div> : null}
    </article>
  )
}
