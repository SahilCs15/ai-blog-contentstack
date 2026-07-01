import { getList } from '@/lib/contentstack'
import { resolveLocale } from '@/lib/locale'
import type { AiNews } from '@/lib/hub-types'
import HubGrid from '@/components/HubGrid'
export const dynamic = 'force-dynamic'
export default async function NewsPage({ params, searchParams }: { params: Promise<{ region: string; locale: string }>; searchParams: Promise<{ live_preview?: string; locale?: string }> }) {
  const { locale: pathLocale } = await params
  const { live_preview, locale: searchLocale } = await searchParams
  const locale = resolveLocale(pathLocale, searchLocale)
  const { items, total } = await getList<AiNews>('ai_news', { limit: 500 }, live_preview, locale)
  const sorted = [...items].sort((a, b) => (b.published_date || '').localeCompare(a.published_date || ''))
  return (
    <section className="section">
      <div className="section__head"><h1>AI News</h1><p className="section__sub">{total} articles tracking the industry.</p></div>
      <HubGrid items={sorted} kind="news" />
    </section>
  )
}
