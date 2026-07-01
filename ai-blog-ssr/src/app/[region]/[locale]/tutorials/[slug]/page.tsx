import Link from '@/components/LocaleLink'
import { getBySlug } from '@/lib/contentstack'
import type { Tutorial } from '@/lib/hub-types'
import { edit } from '@/lib/cslp'
import { resolveLocale } from '@/lib/locale'
import { Empty } from '@/components/States'
export const dynamic = 'force-dynamic'
type Props = { params: Promise<{ region: string; slug: string; locale: string }>; searchParams: Promise<{ live_preview?: string; locale?: string }> }
export default async function TutorialPage({ params, searchParams }: Props) {
  const { slug, locale: pathLocale } = await params; const { live_preview, locale: searchLocale } = await searchParams
  const locale = resolveLocale(pathLocale, searchLocale)
  const t = await getBySlug<Tutorial>('tutorial', slug, ['category'], live_preview, locale)
  if (!t) return <Empty title="Tutorial not found" />
  return (
    <article className="article">
      <Link href="/tutorials" className="backlink">← All tutorials</Link>
      <div className="tool-hero__meta">
        {t.difficulty && <span className={`pill pill--${(t.difficulty || '').toLowerCase()}`}>{t.difficulty}</span>}
        {t.read_time ? <span className="pill">{t.read_time} min</span> : null}
      </div>
      <h1 className="article__title" {...edit(t.$, 'title')}>{t.title}</h1>
      {t.introduction && <p className="article__excerpt" {...edit(t.$, 'introduction')}>{t.introduction}</p>}
      <ol className="steps">
        {(t.steps ?? []).map((s, i) => (
          <li className="step" key={i}><div className="step__num">{i + 1}</div><div>{s.heading && <h3 {...edit(s.$, 'heading')}>{s.heading}</h3>}{s.content && <p {...edit(s.$, 'content')}>{s.content}</p>}</div></li>
        ))}
      </ol>
      {t.conclusion && <div className="block block--callout callout--success"><strong>Conclusion</strong><p {...edit(t.$, 'conclusion')}>{t.conclusion}</p></div>}
    </article>
  )
}
