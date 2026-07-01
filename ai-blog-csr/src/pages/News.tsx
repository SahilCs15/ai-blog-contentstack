import { useCallback, useMemo, useState } from 'react'
import { Link } from '../lib/LocaleLink'
import { getList } from '../lib/contentstack'
import { useEntry } from '../lib/useEntry'
import type { AiNews } from '../lib/hub-types'
import { edit } from '../lib/cslp'
import { imageUrl, formatDate } from '../lib/format'
import { Loading, ErrorState, Empty } from '../components/States'

const PAGE = 24

export default function News() {
  const loader = useCallback(async (locale: string) => {
    const res = await getList<AiNews>('ai_news', { limit: 500 }, locale)
    return res.items
  }, [])
  const { data, loading, error } = useEntry<AiNews[]>(loader)
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)

  const sorted = useMemo(() => {
    let list = [...(data ?? [])]
    if (q.trim()) {
      const n = q.toLowerCase()
      list = list.filter((a) => a.title.toLowerCase().includes(n) || a.excerpt?.toLowerCase().includes(n))
    }
    list.sort((a, b) => (b.published_date || '').localeCompare(a.published_date || ''))
    return list
  }, [data, q])

  const shown = sorted.slice(0, page * PAGE)

  if (loading && !data) return <Loading label="Loading news…" />
  if (error) return <ErrorState error={error} />

  return (
    <section className="section">
      <div className="section__head">
        <h1>AI News</h1>
        <p className="section__sub">{data?.length ?? 0} articles tracking the AI industry.</p>
      </div>
      <input className="search" placeholder="Search news…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} />

      {shown.length === 0 ? (
        <Empty title="No news matches" />
      ) : (
        <>
          <div className="grid grid--3">
            {shown.map((a) => (
              <article className="post-card" key={a.uid}>
                <Link to={`/news/${a.slug ?? a.uid}`} className="post-card__media">
                  {a.featured_image?.url ? (
                    <img src={imageUrl(a.featured_image.url, 700)} alt={a.title} loading="lazy" {...edit(a.featured_image.$, 'url')} />
                  ) : <div className="post-card__placeholder" />}
                </Link>
                <div className="post-card__body">
                  <h3 className="post-card__title"><Link to={`/news/${a.slug ?? a.uid}`} {...edit(a.$, 'title')}>{a.title}</Link></h3>
                  {a.excerpt && <p className="post-card__excerpt" {...edit(a.$, 'excerpt')}>{a.excerpt}</p>}
                  <div className="post-card__meta">
                    {a.author && <span>{a.author}</span>}
                    {a.published_date && <span>· {formatDate(a.published_date)}</span>}
                  </div>
                </div>
              </article>
            ))}
          </div>
          {shown.length < sorted.length && (
            <div className="loadmore"><button className="btn" onClick={() => setPage((p) => p + 1)}>Load more</button></div>
          )}
        </>
      )}
    </section>
  )
}
