import { getList } from '@/lib/contentstack'
import { resolveLocale } from '@/lib/locale'
import type { GlossaryTerm } from '@/lib/hub-types'
import HubGrid from '@/components/HubGrid'
export const dynamic = 'force-dynamic'
export default async function GlossaryPage({ params, searchParams }: { params: Promise<{ region: string; locale: string }>; searchParams: Promise<{ live_preview?: string; locale?: string }> }) {
  const { locale: pathLocale } = await params
  const { live_preview, locale: searchLocale } = await searchParams
  const locale = resolveLocale(pathLocale, searchLocale)
  const { items, total } = await getList<GlossaryTerm>('glossary_term', { limit: 400 }, live_preview, locale)
  const sorted = [...items].sort((a, b) => a.title.localeCompare(b.title))
  return (
    <section className="section">
      <div className="section__head"><h1>AI Glossary</h1><p className="section__sub">{total} terms explained.</p></div>
      <HubGrid items={sorted} kind="glossary" columns={2} />
    </section>
  )
}
