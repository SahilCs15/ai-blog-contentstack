import Link from '@/components/LocaleLink'
import { getBySlug } from '@/lib/contentstack'
import type { AiTool, AiCategory, AiCompany } from '@/lib/hub-types'
import { one } from '@/lib/types'
import { edit } from '@/lib/cslp'
import { imageUrl } from '@/lib/format'
import { Rte } from '@/lib/rte'
import { resolveLocale } from '@/lib/locale'
import { Empty } from '@/components/States'
export const dynamic = 'force-dynamic'
type Props = { params: Promise<{ region: string; slug: string; locale: string }>; searchParams: Promise<{ live_preview?: string; locale?: string }> }
function L({ title, items, kind }: { title: string; items?: string[]; kind: string }) {
  if (!items?.length) return null
  return <div className="detail-list"><h3>{title}</h3><ul className={`bullets bullets--${kind}`}>{items.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
}
export default async function ToolPage({ params, searchParams }: Props) {
  const { slug, locale: pathLocale } = await params; const { live_preview, locale: searchLocale } = await searchParams
  const locale = resolveLocale(pathLocale, searchLocale)
  const tool = await getBySlug<AiTool>('ai_tool', slug, ['category', 'company'], live_preview, locale)
  if (!tool) return <Empty title="Tool not found" />
  const category = one<AiCategory>(tool.category); const company = one<AiCompany>(tool.company)
  const accent = category?.accent_color || '#6366f1'
  return (
    <article className="article" style={{ ['--accent' as string]: accent }}>
      <Link href="/tools" className="backlink">← All tools</Link>
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
          {tool.website_url && <a className="btn" href={tool.website_url} target="_blank" rel="noreferrer">Visit website ↗</a>}
        </div>
      </header>
      {tool.full_description ? <div className="article__body prose"><Rte doc={tool.full_description} /></div> : null}
      <L title="Features" items={tool.features} kind="plain" />
      <div className="proscons"><L title="Pros" items={tool.pros} kind="pro" /><L title="Cons" items={tool.cons} kind="con" /></div>
      <L title="Use cases" items={tool.use_cases} kind="plain" />
    </article>
  )
}
