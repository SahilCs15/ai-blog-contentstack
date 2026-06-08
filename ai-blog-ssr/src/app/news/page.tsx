import { getList } from '@/lib/contentstack'
import type { AiNews } from '@/lib/hub-types'
import HubGrid from '@/components/HubGrid'
export const dynamic = 'force-dynamic'
export default async function NewsPage({ searchParams }: { searchParams: Promise<{ live_preview?: string }> }) {
  const { live_preview } = await searchParams
  const { items, total } = await getList<AiNews>('ai_news', { limit: 500 }, live_preview)
  const sorted = [...items].sort((a, b) => (b.published_date || '').localeCompare(a.published_date || ''))
  return (
    <section className="section">
      <div className="section__head"><h1>AI News</h1><p className="section__sub">{total} articles tracking the industry.</p></div>
      <HubGrid items={sorted} kind="news" />
    </section>
  )
}
