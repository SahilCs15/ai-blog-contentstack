import { getList } from '@/lib/contentstack'
import type { AiModel } from '@/lib/hub-types'
import HubGrid from '@/components/HubGrid'
export const dynamic = 'force-dynamic'
export default async function ModelsPage({ searchParams }: { searchParams: Promise<{ live_preview?: string }> }) {
  const { live_preview } = await searchParams
  const { items, total } = await getList<AiModel>('ai_model', { include: ['developer'], limit: 200 }, live_preview)
  return (
    <section className="section">
      <div className="section__head"><h1>AI Models</h1><p className="section__sub">{total} foundation and frontier models.</p></div>
      <HubGrid items={items} kind="model" />
    </section>
  )
}
