import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getBySlug } from '../lib/contentstack'
import { useEntry } from '../lib/useEntry'
import type { IndustryReport } from '../lib/hub-types'
import { edit } from '../lib/cslp'
import { formatDate } from '../lib/format'
import { Loading, ErrorState, Empty } from '../components/States'

function Section({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null
  return (
    <div className="detail-list">
      <h3>{title}</h3>
      <ul className="bullets bullets--plain">{items.map((x, i) => <li key={i}>{x}</li>)}</ul>
    </div>
  )
}

export default function ReportDetail() {
  const { slug = '' } = useParams()
  const loader = useCallback(() => getBySlug<IndustryReport>('industry_report', slug), [slug])
  const { data: r, loading, error } = useEntry<IndustryReport | null>(loader, [slug])

  if (loading && !r) return <Loading label="Loading report…" />
  if (error) return <ErrorState error={error} />
  if (!r) return <Empty title="Report not found" />

  return (
    <article className="article">
      <Link to="/reports" className="backlink">← All reports</Link>
      <h1 className="article__title" {...edit(r.$, 'title')}>{r.title}</h1>
      <div className="tool-hero__meta">
        {r.market_size && <span className="pill">{r.market_size}</span>}
        {r.published_date && <span className="pill">{formatDate(r.published_date)}</span>}
      </div>
      {r.summary && <p className="article__excerpt" {...edit(r.$, 'summary')}>{r.summary}</p>}
      <Section title="Trends" items={r.trends} />
      <Section title="Challenges" items={r.challenges} />
      <Section title="Opportunities" items={r.opportunities} />
    </article>
  )
}
