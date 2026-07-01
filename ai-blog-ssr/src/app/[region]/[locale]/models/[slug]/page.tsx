import Link from '@/components/LocaleLink'
import { getBySlug } from '@/lib/contentstack'
import type { AiModel, AiCompany } from '@/lib/hub-types'
import { one } from '@/lib/types'
import { edit } from '@/lib/cslp'
import { formatDate } from '@/lib/format'
import { Rte } from '@/lib/rte'
import { resolveLocale } from '@/lib/locale'
import { Empty } from '@/components/States'
export const dynamic = 'force-dynamic'
type Props = { params: Promise<{ region: string; slug: string; locale: string }>; searchParams: Promise<{ live_preview?: string; locale?: string }> }
function C({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null
  return <div className="detail-list"><h3>{title}</h3><div className="chiprow">{items.map((x, i) => <span className="pill" key={i}>{x}</span>)}</div></div>
}
export default async function ModelPage({ params, searchParams }: Props) {
  const { slug, locale: pathLocale } = await params; const { live_preview, locale: searchLocale } = await searchParams
  const locale = resolveLocale(pathLocale, searchLocale)
  const m = await getBySlug<AiModel>('ai_model', slug, ['developer'], live_preview, locale)
  if (!m) return <Empty title="Model not found" />
  const dev = one<AiCompany>(m.developer)
  return (
    <article className="article">
      <Link href="/models" className="backlink">← All models</Link>
      <h1 className="article__title" {...edit(m.$, 'title')}>{m.title}</h1>
      <div className="tool-hero__meta">
        {dev?.title && <span className="pill">by {dev.title}</span>}
        {m.context_window && <span className="pill">{m.context_window} context</span>}
        {m.release_date && <span className="pill">Released {formatDate(m.release_date)}</span>}
      </div>
      {m.description && <p className="article__excerpt" {...edit(m.$, 'description')}>{m.description}</p>}
      {m.details ? <div className="article__body prose"><Rte doc={m.details} /></div> : null}
      <C title="Modalities" items={m.modalities} /><C title="Strengths" items={m.strengths} /><C title="Limitations" items={m.limitations} />
    </article>
  )
}
