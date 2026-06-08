import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getBySlug } from '../lib/contentstack'
import { useEntry } from '../lib/useEntry'
import type { AiModel, AiCompany } from '../lib/hub-types'
import { one } from '../lib/types'
import { edit } from '../lib/cslp'
import { formatDate } from '../lib/format'
import { Rte } from '../lib/rte'
import { Loading, ErrorState, Empty } from '../components/States'

function Chips({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null
  return (
    <div className="detail-list">
      <h3>{title}</h3>
      <div className="chiprow">{items.map((x, i) => <span className="pill" key={i}>{x}</span>)}</div>
    </div>
  )
}

export default function ModelDetail() {
  const { slug = '' } = useParams()
  const loader = useCallback(() => getBySlug<AiModel>('ai_model', slug, ['developer']), [slug])
  const { data: m, loading, error } = useEntry<AiModel | null>(loader, [slug])

  if (loading && !m) return <Loading label="Loading model…" />
  if (error) return <ErrorState message={error} />
  if (!m) return <Empty title="Model not found" />

  const dev = one<AiCompany>(m.developer)
  return (
    <article className="article">
      <Link to="/models" className="backlink">← All models</Link>
      <h1 className="article__title" {...edit(m.$, 'title')}>{m.title}</h1>
      <div className="tool-hero__meta">
        {dev?.title && <span className="pill">by {dev.title}</span>}
        {m.context_window && <span className="pill">{m.context_window} context</span>}
        {m.release_date && <span className="pill">Released {formatDate(m.release_date)}</span>}
      </div>
      {m.description && <p className="article__excerpt" {...edit(m.$, 'description')}>{m.description}</p>}
      {m.details ? <div className="article__body prose"><Rte doc={m.details} /></div> : null}
      <Chips title="Modalities" items={m.modalities} />
      <Chips title="Strengths" items={m.strengths} />
      <Chips title="Limitations" items={m.limitations} />
    </article>
  )
}
