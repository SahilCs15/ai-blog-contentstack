import Link from '@/components/LocaleLink'
import { getBySlug } from '@/lib/contentstack'
import type { UseCase } from '@/lib/hub-types'
import { edit } from '@/lib/cslp'
import { resolveLocale } from '@/lib/locale'
import { Empty } from '@/components/States'
export const dynamic = 'force-dynamic'
type Props = { params: Promise<{ region: string; slug: string; locale: string }>; searchParams: Promise<{ live_preview?: string; locale?: string }> }
export default async function UseCasePage({ params, searchParams }: Props) {
  const { slug, locale: pathLocale } = await params; const { live_preview, locale: searchLocale } = await searchParams
  const locale = resolveLocale(pathLocale, searchLocale)
  const u = await getBySlug<UseCase>('use_case', slug, [], live_preview, locale)
  if (!u) return <Empty title="Use case not found" />
  return (
    <article className="article">
      <Link href="/use-cases" className="backlink">← All use cases</Link>
      {u.industry && <span className="pill">{u.industry}</span>}
      <h1 className="article__title" {...edit(u.$, 'title')}>{u.title}</h1>
      {u.problem && <div className="detail-list"><h3>Problem</h3><p {...edit(u.$, 'problem')}>{u.problem}</p></div>}
      {u.solution && <div className="detail-list"><h3>Solution</h3><p {...edit(u.$, 'solution')}>{u.solution}</p></div>}
      {u.benefits?.length ? <div className="detail-list"><h3>Benefits</h3><ul className="bullets bullets--pro">{u.benefits.map((b, i) => <li key={i}>{b}</li>)}</ul></div> : null}
      {u.tools_used?.length ? <div className="detail-list"><h3>Tools used</h3><div className="chiprow">{u.tools_used.map((t, i) => <span className="pill" key={i}>{t}</span>)}</div></div> : null}
    </article>
  )
}
