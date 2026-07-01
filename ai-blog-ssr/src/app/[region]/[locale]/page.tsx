import Link from '@/components/LocaleLink'
import { getLandingPage, getList } from '@/lib/contentstack'
import type { AiTool, AiCategory, AiNews } from '@/lib/hub-types'
import { resolveLocale } from '@/lib/locale'
import { edit } from '@/lib/cslp'
import { imageUrl } from '@/lib/format'
import ToolCard from '@/components/ToolCard'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ region: string; locale: string }>
  searchParams: Promise<{ live_preview?: string; locale?: string }>
}

export default async function HomePage({ params, searchParams }: Props) {
  const { locale: pathLocale } = await params
  const { live_preview, locale: searchLocale } = await searchParams
  const locale = resolveLocale(pathLocale, searchLocale)
  const [page, tools, categories, news] = await Promise.all([
    getLandingPage(live_preview, locale),
    getList<AiTool>('ai_tool', { include: ['category', 'company'], limit: 6 }, live_preview, locale),
    getList<AiCategory>('ai_category', { limit: 12 }, live_preview, locale),
    getList<AiNews>('ai_news', { limit: 6 }, live_preview, locale),
  ])

  const stats = page?.stats?.length
    ? page.stats
    : [
        { value: `${tools.total}+`, label: 'AI Tools' },
        { value: `${news.total}+`, label: 'News Articles' },
        { value: `${categories.total}`, label: 'Categories' },
      ]

  return (
    <>
      <section className="hero">
        {page?.hero_image?.url && (
          <div className="hero__bg" style={{ backgroundImage: `url(${imageUrl(page.hero_image.url, 1800)})` }} {...edit(page.hero_image.$, 'url')} />
        )}
        <div className="hero__overlay" />
        <div className="hero__content">
          <p className="hero__eyebrow" {...edit(page?.$, 'hero_eyebrow')}>{page?.hero_eyebrow || 'The Ultimate AI Knowledge Hub'}</p>
          <h1 className="hero__heading" {...edit(page?.$, 'hero_heading')}>{page?.hero_heading || 'Discover the world of AI, all in one place.'}</h1>
          <p className="hero__sub" {...edit(page?.$, 'hero_subheading')}>
            {page?.hero_subheading || 'AI tools, models, companies, tutorials, news, and industry insights — curated for builders and the curious.'}
          </p>
          <div style={{ marginTop: 22, display: 'flex', gap: 12 }}>
            {tools.items.length ? <Link className="btn" href="/tools">Browse tools</Link> : null}
            {news.items.length ? <Link className="btn" href="/news" style={{ background: 'var(--surface-2)' }}>Latest news</Link> : null}
            {!tools.items.length && !news.items.length ? <Link className="btn" href="/blog">Read the blog</Link> : null}
          </div>
        </div>
      </section>

      <section className="stats">
        {stats.map((s, i) => (
          <div className="stat" key={i}>
            <div className="stat__value" {...edit(s.$, 'value')}>{s.value}</div>
            <div className="stat__label" {...edit(s.$, 'label')}>{s.label}</div>
          </div>
        ))}
      </section>

      {categories.items.length ? (
        <section className="section">
          <div className="section__head"><h2>Explore by category</h2></div>
          <div className="filterbar">
            {categories.items.map((c) => (
              <Link key={c.uid} href="/tools" className="filter" style={{ ['--chip' as string]: c.accent_color || '#6366f1' }}>
                {c.icon ? `${c.icon} ` : ''}{c.title}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {tools.items.length ? (
        <section className="section">
          <div className="section__head">
            <h2>Featured tools</h2>
            <p className="section__sub">Popular picks from the directory.</p>
          </div>
          <div className="grid grid--3">
            {tools.items.map((t) => <ToolCard tool={t} key={t.uid} />)}
          </div>
        </section>
      ) : null}

      {news.items.length ? (
        <section className="section">
          <div className="section__head">
            <h2>Latest news</h2>
            <Link href="/news" className="backlink">View all →</Link>
          </div>
          <div className="grid grid--3">
            {news.items.map((a) => (
              <article className="post-card" key={a.uid}>
                <Link href={`/news/${a.slug ?? a.uid}`} className="post-card__media">
                  {a.featured_image?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageUrl(a.featured_image.url, 700)} alt={a.title} loading="lazy" />
                  ) : <div className="post-card__placeholder" />}
                </Link>
                <div className="post-card__body">
                  <h3 className="post-card__title"><Link href={`/news/${a.slug ?? a.uid}`} {...edit(a.$, 'title')}>{a.title}</Link></h3>
                  {a.excerpt && <p className="post-card__excerpt" {...edit(a.$, 'excerpt')}>{a.excerpt}</p>}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </>
  )
}
