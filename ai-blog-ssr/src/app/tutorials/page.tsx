import { getList } from '@/lib/contentstack'
import type { Tutorial } from '@/lib/hub-types'
import HubGrid from '@/components/HubGrid'
export const dynamic = 'force-dynamic'
export default async function TutorialsPage({ searchParams }: { searchParams: Promise<{ live_preview?: string }> }) {
  const { live_preview } = await searchParams
  const { items, total } = await getList<Tutorial>('tutorial', { limit: 200 }, live_preview)
  return (
    <section className="section">
      <div className="section__head"><h1>Tutorials</h1><p className="section__sub">{total} step-by-step guides.</p></div>
      <HubGrid items={items} kind="tutorial" />
    </section>
  )
}
