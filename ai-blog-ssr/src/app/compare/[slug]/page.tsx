import Link from 'next/link'
import { getBySlug } from '@/lib/contentstack'
import type { Comparison } from '@/lib/hub-types'
import { edit } from '@/lib/cslp'
import { Empty } from '@/components/States'
export const dynamic = 'force-dynamic'
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ live_preview?: string }> }
export default async function ComparisonPage({ params, searchParams }: Props) {
  const { slug } = await params; const { live_preview } = await searchParams
  const c = await getBySlug<Comparison>('comparison', slug, [], live_preview)
  if (!c) return <Empty title="Comparison not found" />
  return (
    <article className="article">
      <Link href="/compare" className="backlink">← All comparisons</Link>
      <h1 className="article__title" {...edit(c.$, 'title')}>{c.title}</h1>
      {c.overview && <p className="article__excerpt" {...edit(c.$, 'overview')}>{c.overview}</p>}
      {c.feature_comparison?.length ? (
        <div className="cmp-table-wrap"><table className="cmp-table">
          <thead><tr><th>Feature</th><th>{c.tool_a}</th><th>{c.tool_b}</th></tr></thead>
          <tbody>{c.feature_comparison.map((row, i) => <tr key={i}><td>{row.feature}</td><td>{row.value_a}</td><td>{row.value_b}</td></tr>)}</tbody>
        </table></div>
      ) : null}
      {c.pricing_comparison && <div className="detail-list"><h3>Pricing</h3><p {...edit(c.$, 'pricing_comparison')}>{c.pricing_comparison}</p></div>}
      {c.verdict && <div className="block block--callout callout--info"><strong>Verdict</strong><p {...edit(c.$, 'verdict')}>{c.verdict}</p></div>}
    </article>
  )
}
