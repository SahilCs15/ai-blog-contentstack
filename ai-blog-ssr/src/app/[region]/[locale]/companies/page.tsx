import { getList } from '@/lib/contentstack'
import { resolveLocale } from '@/lib/locale'
import type { AiCompany } from '@/lib/hub-types'
import HubGrid from '@/components/HubGrid'
export const dynamic = 'force-dynamic'
export default async function CompaniesPage({ params, searchParams }: { params: Promise<{ region: string; locale: string }>; searchParams: Promise<{ live_preview?: string; locale?: string }> }) {
  const { locale: pathLocale } = await params
  const { live_preview, locale: searchLocale } = await searchParams
  const locale = resolveLocale(pathLocale, searchLocale)
  const { items, total } = await getList<AiCompany>('ai_company', { limit: 100 }, live_preview, locale)
  return (
    <section className="section">
      <div className="section__head"><h1>AI Companies</h1><p className="section__sub">{total} organizations shaping AI.</p></div>
      <HubGrid items={items} kind="company" columns={2} />
    </section>
  )
}
