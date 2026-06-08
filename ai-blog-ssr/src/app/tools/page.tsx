import { getList } from '@/lib/contentstack'
import type { AiTool, AiCategory } from '@/lib/hub-types'
import HubGrid from '@/components/HubGrid'
export const dynamic = 'force-dynamic'
export default async function ToolsPage({ searchParams }: { searchParams: Promise<{ live_preview?: string }> }) {
  const { live_preview } = await searchParams
  const [tools, cats] = await Promise.all([
    getList<AiTool>('ai_tool', { include: ['category', 'company'], limit: 300 }, live_preview),
    getList<AiCategory>('ai_category', { limit: 100 }, live_preview),
  ])
  return (
    <section className="section">
      <div className="section__head">
        <h1>AI Tools Directory</h1>
        <p className="section__sub">{tools.total} tools across {cats.total} categories.</p>
      </div>
      <HubGrid items={tools.items} kind="tool" categories={cats.items} />
    </section>
  )
}
