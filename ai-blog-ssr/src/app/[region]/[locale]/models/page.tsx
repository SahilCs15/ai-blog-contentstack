import { getList } from '@/lib/contentstack'
import { resolveLocale } from '@/lib/locale'
import type { AiModel } from '@/lib/hub-types'
import HubGrid from '@/components/HubGrid'
export const dynamic = 'force-dynamic'
export default async function ModelsPage({ params, searchParams }: { params: Promise<{ region: string; locale: string }>; searchParams: Promise<{ live_preview?: string; locale?: string }> }) {
  const { locale: pathLocale } = await params
  const { live_preview, locale: searchLocale } = await searchParams
  const locale = resolveLocale(pathLocale, searchLocale)
  const { items, total } = await getList<AiModel>('ai_model', { include: ['developer'], limit: 200 }, live_preview, locale)
  return (
    <section className="section">
      <div className="section__head"><h1>AI Models</h1><p className="section__sub">{total} foundation and frontier models.</p></div>
      <HubGrid items={items} kind="model" />
    </section>
  )
}
