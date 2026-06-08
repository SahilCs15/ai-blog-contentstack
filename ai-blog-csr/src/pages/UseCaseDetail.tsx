import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getBySlug } from '../lib/contentstack'
import { useEntry } from '../lib/useEntry'
import type { UseCase } from '../lib/hub-types'
import { edit } from '../lib/cslp'
import { Loading, ErrorState, Empty } from '../components/States'

export default function UseCaseDetail() {
  const { slug = '' } = useParams()
  const loader = useCallback(() => getBySlug<UseCase>('use_case', slug), [slug])
  const { data: u, loading, error } = useEntry<UseCase | null>(loader, [slug])

  if (loading && !u) return <Loading label="Loading use case…" />
  if (error) return <ErrorState message={error} />
  if (!u) return <Empty title="Use case not found" />

  return (
    <article className="article">
      <Link to="/use-cases" className="backlink">← All use cases</Link>
      {u.industry && <span className="pill">{u.industry}</span>}
      <h1 className="article__title" {...edit(u.$, 'title')}>{u.title}</h1>
      {u.problem && (
        <div className="detail-list"><h3>Problem</h3><p {...edit(u.$, 'problem')}>{u.problem}</p></div>
      )}
      {u.solution && (
        <div className="detail-list"><h3>Solution</h3><p {...edit(u.$, 'solution')}>{u.solution}</p></div>
      )}
      {u.benefits?.length ? (
        <div className="detail-list"><h3>Benefits</h3><ul className="bullets bullets--pro">{u.benefits.map((b, i) => <li key={i}>{b}</li>)}</ul></div>
      ) : null}
      {u.tools_used?.length ? (
        <div className="detail-list"><h3>Tools used</h3><div className="chiprow">{u.tools_used.map((t, i) => <span className="pill" key={i}>{t}</span>)}</div></div>
      ) : null}
    </article>
  )
}
