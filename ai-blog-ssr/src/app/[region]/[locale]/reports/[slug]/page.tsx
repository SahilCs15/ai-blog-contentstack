import Link from '@/components/LocaleLink'
import { getBySlug } from '@/lib/contentstack'
import type { IndustryReport } from '@/lib/hub-types'
import { edit } from '@/lib/cslp'
import { formatDate } from '@/lib/format'
import { resolveLocale } from '@/lib/locale'
import { Empty } from '@/components/States'
export const dynamic = 'force-dynamic'
type Props = { params: Promise<{ region: string; slug: string; locale: string }>; searchParams: Promise<{ live_preview?: string; locale?: string }> }
function S({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null
  return <div className="detail-list"><h3>{title}</h3><ul className="bullets bullets--plain">{items.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
}
export default async function ReportPage({ params, searchParams }: Props) {
  const { slug, locale: pathLocale } = await params; const { live_preview, locale: searchLocale } = await searchParams
  const locale = resolveLocale(pathLocale, searchLocale)
  const r = await getBySlug<IndustryReport>('industry_report', slug, [], live_preview, locale)
  if (!r) return <Empty title="Report not found" />
  return (
    <article className="article">
      <Link href="/reports" className="backlink">← All reports</Link>
      <h1 className="article__title" {...edit(r.$, 'title')}>{r.title}</h1>
      <div className="tool-hero__meta">{r.market_size && <span className="pill">{r.market_size}</span>}{r.published_date && <span className="pill">{formatDate(r.published_date)}</span>}</div>
      {r.summary && <p className="article__excerpt" {...edit(r.$, 'summary')}>{r.summary}</p>}
      <S title="Trends" items={r.trends} /><S title="Challenges" items={r.challenges} /><S title="Opportunities" items={r.opportunities} />
    </article>
  )
}
