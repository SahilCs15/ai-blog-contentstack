import { getList } from '@/lib/contentstack'
import type { IndustryReport } from '@/lib/hub-types'
import HubGrid from '@/components/HubGrid'
export const dynamic = 'force-dynamic'
export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ live_preview?: string }> }) {
  const { live_preview } = await searchParams
  const { items, total } = await getList<IndustryReport>('industry_report', { limit: 100 }, live_preview)
  return (
    <section className="section">
      <div className="section__head"><h1>Industry Reports</h1><p className="section__sub">{total} market reports.</p></div>
      <HubGrid items={items} kind="report" columns={2} />
    </section>
  )
}
