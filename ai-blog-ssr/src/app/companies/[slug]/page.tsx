import Link from 'next/link'
import { getBySlug } from '@/lib/contentstack'
import type { AiCompany } from '@/lib/hub-types'
import { edit } from '@/lib/cslp'
import { imageUrl } from '@/lib/format'
import { Empty } from '@/components/States'
export const dynamic = 'force-dynamic'
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ live_preview?: string }> }
export default async function CompanyPage({ params, searchParams }: Props) {
  const { slug } = await params; const { live_preview } = await searchParams
  const c = await getBySlug<AiCompany>('ai_company', slug, [], live_preview)
  if (!c) return <Empty title="Company not found" />
  return (
    <article className="article">
      <Link href="/companies" className="backlink">← All companies</Link>
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
      {c.featured_products?.length ? <div className="detail-list"><h3>Featured products</h3><div className="chiprow">{c.featured_products.map((p, i) => <span className="pill" key={i}>{p}</span>)}</div></div> : null}
    </article>
  )
}
