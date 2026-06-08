import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getBySlug } from '../lib/contentstack'
import { useEntry } from '../lib/useEntry'
import type { AiTool, AiCategory, AiCompany } from '../lib/hub-types'
import { one } from '../lib/types'
import { edit } from '../lib/cslp'
import { imageUrl } from '../lib/format'
import { Rte } from '../lib/rte'
import { Loading, ErrorState, Empty } from '../components/States'

function List({ title, items, kind }: { title: string; items?: string[]; kind: 'pro' | 'con' | 'plain' }) {
  if (!items?.length) return null
  return (
    <div className="detail-list">
      <h3>{title}</h3>
      <ul className={`bullets bullets--${kind}`}>
        {items.map((x, i) => <li key={i}>{x}</li>)}
      </ul>
    </div>
  )
}

export default function ToolDetail() {
  const { slug = '' } = useParams()
  const loader = useCallback(() => getBySlug<AiTool>('ai_tool', slug, ['category', 'company']), [slug])
  const { data: tool, loading, error } = useEntry<AiTool | null>(loader, [slug])

  if (loading && !tool) return <Loading label="Loading tool…" />
  if (error) return <ErrorState message={error} />
  if (!tool) return <Empty title="Tool not found" />

  const category = one<AiCategory>(tool.category)
  const company = one<AiCompany>(tool.company)
  const accent = category?.accent_color || '#6366f1'

  return (
    <article className="article" style={{ ['--accent' as string]: accent }}>
      <Link to="/tools" className="backlink">← All tools</Link>
      <header className="tool-hero">
        {tool.logo?.url && <img className="tool-hero__logo" src={imageUrl(tool.logo.url, 160)} alt={tool.title} {...edit(tool.logo.$, 'url')} />}
        <div>
          <h1 {...edit(tool.$, 'title')}>{tool.title}</h1>
          <div className="tool-hero__meta">
            {category && <span className="chip" style={{ ['--chip' as string]: accent }}>{category.title}</span>}
            {tool.pricing_model && <span className="pill">{tool.pricing_model}</span>}
            {tool.rating ? <span className="pill">★ {tool.rating.toFixed(1)}</span> : null}
            {company?.title && <span className="tool-hero__company">by {company.title}</span>}
          </div>
          {tool.short_description && <p className="article__excerpt" {...edit(tool.$, 'short_description')}>{tool.short_description}</p>}
          {tool.website_url && (
            <a className="btn" href={tool.website_url} target="_blank" rel="noreferrer">Visit website ↗</a>
          )}
        </div>
      </header>

      {tool.full_description ? (
        <div className="article__body prose"><Rte doc={tool.full_description} /></div>
      ) : null}

      <List title="Features" items={tool.features} kind="plain" />
      <div className="proscons">
        <List title="Pros" items={tool.pros} kind="pro" />
        <List title="Cons" items={tool.cons} kind="con" />
      </div>
      <List title="Use cases" items={tool.use_cases} kind="plain" />
    </article>
  )
}
