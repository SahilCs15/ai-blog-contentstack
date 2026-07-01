import { useCallback } from 'react'
import { Link } from '../lib/LocaleLink'
import { getLandingPage, getList } from '../lib/contentstack'
import { useEntry } from '../lib/useEntry'
import type { LandingPage } from '../lib/types'
import type { AiTool, AiCategory, AiNews } from '../lib/hub-types'
import { edit } from '../lib/cslp'
import { imageUrl } from '../lib/format'
import ToolCard from '../components/ToolCard'
import { Loading, ErrorState } from '../components/States'

interface HomeData {
  page: LandingPage | null
  tools: AiTool[]
  categories: AiCategory[]
  news: AiNews[]
  counts: { tools: number; news: number; categories: number }
}

export default function Home() {
  const loader = useCallback(async (locale: string): Promise<HomeData> => {
    const [page, tools, categories, news] = await Promise.all([
      getLandingPage(locale),
      getList<AiTool>('ai_tool', { include: ['category', 'company'], limit: 6 }, locale),
      getList<AiCategory>('ai_category', { limit: 12 }, locale),
      getList<AiNews>('ai_news', { limit: 6 }, locale),
    ])
    return {
      page,
      tools: tools.items,
      categories: categories.items,
      news: news.items,
      counts: { tools: tools.total, news: news.total, categories: categories.total },
    }
  }, [])
  const { data, loading, error } = useEntry<HomeData>(loader)

  if (loading && !data) return <Loading label="Loading the AI hub…" />
  if (error) return <ErrorState error={error} />
  const page = data?.page

  const stats = page?.stats?.length
    ? page.stats
    : [
        { value: `${data?.counts.tools ?? 0}+`, label: 'AI Tools' },
        { value: `${data?.counts.news ?? 0}+`, label: 'News Articles' },
        { value: `${data?.counts.categories ?? 0}`, label: 'Categories' },
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
            {data?.tools.length ? <Link className="btn" to="/tools">Browse tools</Link> : null}
            {data?.news.length ? <Link className="btn" to="/news" style={{ background: 'var(--surface-2)' }}>Latest news</Link> : null}
            {!data?.tools.length && !data?.news.length ? <Link className="btn" to="/blog">Read the blog</Link> : null}
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

      {data?.categories.length ? (
        <section className="section">
          <div className="section__head"><h2>Explore by category</h2></div>
          <div className="filterbar">
            {data.categories.map((c) => (
              <Link key={c.uid} to="/tools" className="filter" style={{ ['--chip' as string]: c.accent_color || '#6366f1' }}>
                {c.icon ? `${c.icon} ` : ''}{c.title}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {data?.tools.length ? (
        <section className="section">
          <div className="section__head">
            <h2>Featured tools</h2>
            <p className="section__sub">Popular picks from the directory.</p>
          </div>
          <div className="grid grid--3">{data.tools.map((t) => <ToolCard tool={t} key={t.uid} />)}</div>
        </section>
      ) : null}

      {data?.news.length ? (
        <section className="section">
          <div className="section__head">
            <h2>Latest news</h2>
            <Link to="/news" className="backlink">View all →</Link>
          </div>
          <div className="grid grid--3">
            {data.news.map((a) => (
              <article className="post-card" key={a.uid}>
                <Link to={`/news/${a.slug ?? a.uid}`} className="post-card__media">
                  {a.featured_image?.url ? <img src={imageUrl(a.featured_image.url, 700)} alt={a.title} loading="lazy" /> : <div className="post-card__placeholder" />}
                </Link>
                <div className="post-card__body">
                  <h3 className="post-card__title"><Link to={`/news/${a.slug ?? a.uid}`} {...edit(a.$, 'title')}>{a.title}</Link></h3>
                  {a.excerpt && <p className="post-card__excerpt">{a.excerpt}</p>}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </>
  )
}
