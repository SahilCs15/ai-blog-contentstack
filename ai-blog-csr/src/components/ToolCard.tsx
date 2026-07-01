import { Link } from '../lib/LocaleLink'
import type { AiTool, AiCategory, AiCompany } from '../lib/hub-types'
import { one } from '../lib/types'
import { edit } from '../lib/cslp'
import { imageUrl } from '../lib/format'

export default function ToolCard({ tool }: { tool: AiTool }) {
  const category = one<AiCategory>(tool.category)
  const company = one<AiCompany>(tool.company)
  const accent = category?.accent_color || '#6366f1'
  const to = `/tools/${tool.slug ?? tool.uid}`

  return (
    <article className="tool-card">
      <Link to={to} className="tool-card__head">
        {tool.logo?.url ? (
          <img className="tool-card__logo" src={imageUrl(tool.logo.url, 96)} alt={tool.title} {...edit(tool.logo.$, 'url')} />
        ) : (
          <div className="tool-card__logo tool-card__logo--ph" style={{ background: accent }} />
        )}
        <div className="tool-card__headtext">
          <h3 {...edit(tool.$, 'title')}>{tool.title}</h3>
          {company?.title && <span className="tool-card__company">{company.title}</span>}
        </div>
        {tool.rating ? <span className="tool-card__rating">★ {tool.rating.toFixed(1)}</span> : null}
      </Link>
      {tool.short_description && (
        <p className="tool-card__desc" {...edit(tool.$, 'short_description')}>{tool.short_description}</p>
      )}
      <div className="tool-card__foot">
        {category && (
          <span className="chip" style={{ ['--chip' as string]: accent }}>{category.title}</span>
        )}
        {tool.pricing_model && <span className="pill">{tool.pricing_model}</span>}
        {tool.featured && <span className="pill pill--feat">Featured</span>}
      </div>
    </article>
  )
}
