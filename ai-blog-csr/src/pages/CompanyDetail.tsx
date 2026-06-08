import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getBySlug } from '../lib/contentstack'
import { useEntry } from '../lib/useEntry'
import type { AiCompany } from '../lib/hub-types'
import { edit } from '../lib/cslp'
import { imageUrl } from '../lib/format'
import { Loading, ErrorState, Empty } from '../components/States'

export default function CompanyDetail() {
  const { slug = '' } = useParams()
  const loader = useCallback(() => getBySlug<AiCompany>('ai_company', slug), [slug])
  const { data: c, loading, error } = useEntry<AiCompany | null>(loader, [slug])

  if (loading && !c) return <Loading label="Loading company…" />
  if (error) return <ErrorState message={error} />
  if (!c) return <Empty title="Company not found" />

  return (
    <article className="article">
      <Link to="/companies" className="backlink">← All companies</Link>
      <header className="tool-hero">
        {c.logo?.url && <img className="tool-hero__logo" src={imageUrl(c.logo.url, 160)} alt={c.title} {...edit(c.logo.$, 'url')} />}
        <div>
          <h1 {...edit(c.$, 'title')}>{c.title}</h1>
          <div className="tool-hero__meta">
            {c.industry && <span className="pill">{c.industry}</span>}
            {c.founded_year && <span className="pill">Founded {c.founded_year}</span>}
            {c.funding && <span className="pill">{c.funding}</span>}
          </div>
          {c.description && <p className="article__excerpt" {...edit(c.$, 'description')}>{c.description}</p>}
          {c.website && <a className="btn" href={c.website} target="_blank" rel="noreferrer">Visit website ↗</a>}
        </div>
      </header>
      <div className="company-facts">
        {c.ceo && <div><span>CEO</span><strong>{c.ceo}</strong></div>}
        {c.headquarters && <div><span>HQ</span><strong>{c.headquarters}</strong></div>}
        {c.founded_year && <div><span>Founded</span><strong>{c.founded_year}</strong></div>}
      </div>
      {c.featured_products?.length ? (
        <div className="detail-list"><h3>Featured products</h3><div className="chiprow">{c.featured_products.map((p, i) => <span className="pill" key={i}>{p}</span>)}</div></div>
      ) : null}
    </article>
  )
}
