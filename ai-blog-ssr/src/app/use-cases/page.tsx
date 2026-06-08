import { getList } from '@/lib/contentstack'
import type { UseCase } from '@/lib/hub-types'
import HubGrid from '@/components/HubGrid'
export const dynamic = 'force-dynamic'
export default async function UseCasesPage({ searchParams }: { searchParams: Promise<{ live_preview?: string }> }) {
  const { live_preview } = await searchParams
  const { items, total } = await getList<UseCase>('use_case', { limit: 200 }, live_preview)
  return (
    <section className="section">
      <div className="section__head"><h1>Use Cases</h1><p className="section__sub">{total} real-world AI applications.</p></div>
      <HubGrid items={items} kind="usecase" columns={2} />
    </section>
  )
}
