import Link from '@/components/LocaleLink'
import { getAllCategories, getAllPosts } from '@/lib/contentstack'
import { resolveLocale } from '@/lib/locale'
import { one } from '@/lib/types'
import type { Category } from '@/lib/types'
import { edit } from '@/lib/cslp'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ region: string; locale: string }>
  searchParams: Promise<{ live_preview?: string; locale?: string }>
}

export default async function TopicsPage({ params, searchParams }: Props) {
  const { locale: pathLocale } = await params
  const { live_preview, locale: searchLocale } = await searchParams
  const locale = resolveLocale(pathLocale, searchLocale)
  const [categories, posts] = await Promise.all([
    getAllCategories(live_preview, locale),
    getAllPosts(live_preview, locale),
  ])

  const count = (catUid: string) =>
    posts.filter((p) => one<Category>(p.category)?.uid === catUid).length

  return (
    <section className="section">
      <div className="section__head">
        <h1>Topics</h1>
        <p className="section__sub">Browse the journal by area of coverage.</p>
      </div>
      <div className="grid grid--2">
        {categories.map((c) => {
          const n = count(c.uid)
          return (
            <Link href="/blog" key={c.uid} className="topic" style={{ ['--chip' as string]: c.accent_color || '#6366f1' }}>
              <span className="topic__dot" />
              <div>
                <h3 {...edit(c.$, 'title')}>{c.title}</h3>
                {c.description && <p {...edit(c.$, 'description')}>{c.description}</p>}
                <span className="topic__count">{n} article{n === 1 ? '' : 's'}</span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
