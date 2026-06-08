import { getList } from '@/lib/contentstack'
import type { AiCompany } from '@/lib/hub-types'
import HubGrid from '@/components/HubGrid'
export const dynamic = 'force-dynamic'
export default async function CompaniesPage({ searchParams }: { searchParams: Promise<{ live_preview?: string }> }) {
  const { live_preview } = await searchParams
  const { items, total } = await getList<AiCompany>('ai_company', { limit: 100 }, live_preview)
  return (
    <section className="section">
      <div className="section__head"><h1>AI Companies</h1><p className="section__sub">{total} organizations shaping AI.</p></div>
      <HubGrid items={items} kind="company" columns={2} />
    </section>
  )
}
