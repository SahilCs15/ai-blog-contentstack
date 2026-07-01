import { getList } from '@/lib/contentstack'
import { resolveLocale } from '@/lib/locale'
import type { AiTool, AiCategory } from '@/lib/hub-types'
import HubGrid from '@/components/HubGrid'
export const dynamic = 'force-dynamic'
export default async function ToolsPage({ params, searchParams }: { params: Promise<{ region: string; locale: string }>; searchParams: Promise<{ live_preview?: string; locale?: string }> }) {
  const { locale: pathLocale } = await params
  const { live_preview, locale: searchLocale } = await searchParams
  const locale = resolveLocale(pathLocale, searchLocale)
  const [tools, cats] = await Promise.all([
    getList<AiTool>('ai_tool', { include: ['category', 'company'], limit: 300 }, live_preview, locale),
    getList<AiCategory>('ai_category', { limit: 100 }, live_preview, locale),
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
