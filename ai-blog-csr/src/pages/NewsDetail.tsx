import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getBySlug } from '../lib/contentstack'
import { useEntry } from '../lib/useEntry'
import type { AiNews } from '../lib/hub-types'
import { edit } from '../lib/cslp'
import { imageUrl, formatDate } from '../lib/format'
import { Rte } from '../lib/rte'
import { Loading, ErrorState, Empty } from '../components/States'

export default function NewsDetail() {
  const { slug = '' } = useParams()
  const loader = useCallback(() => getBySlug<AiNews>('ai_news', slug, ['related_companies', 'category']), [slug])
  const { data: article, loading, error } = useEntry<AiNews | null>(loader, [slug])

  if (loading && !article) return <Loading label="Loading article…" />
  if (error) return <ErrorState message={error} />
  if (!article) return <Empty title="Article not found" />

  return (
    <article className="article">
      <Link to="/news" className="backlink">← All news</Link>
      <h1 className="article__title" {...edit(article.$, 'title')}>{article.title}</h1>
      <div className="byline">
        <div>
          {article.author && <div className="byline__name">{article.author}</div>}
          {article.published_date && <div className="byline__meta">{formatDate(article.published_date)}</div>}
        </div>
      </div>
      {article.featured_image?.url && (
        <div className="article__hero">
          <img src={imageUrl(article.featured_image.url, 1400)} alt={article.title} {...edit(article.featured_image.$, 'url')} />
        </div>
      )}
      <div className="article__body prose">
        {article.body ? <Rte doc={article.body} /> : null}
      </div>
      {article.topics?.length ? (
        <div className="tags">{article.topics.map((t) => <span className="tag" key={t}>#{t}</span>)}</div>
      ) : null}
    </article>
  )
}
