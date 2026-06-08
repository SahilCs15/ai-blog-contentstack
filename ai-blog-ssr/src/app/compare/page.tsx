import { getList } from '@/lib/contentstack'
import type { Comparison } from '@/lib/hub-types'
import HubGrid from '@/components/HubGrid'
export const dynamic = 'force-dynamic'
export default async function ComparePage({ searchParams }: { searchParams: Promise<{ live_preview?: string }> }) {
  const { live_preview } = await searchParams
  const { items, total } = await getList<Comparison>('comparison', { limit: 200 }, live_preview)
  return (
    <section className="section">
      <div className="section__head"><h1>Comparisons</h1><p className="section__sub">{total} head-to-head breakdowns.</p></div>
      <HubGrid items={items} kind="comparison" />
    </section>
  )
}
