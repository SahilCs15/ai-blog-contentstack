import { getAllPosts, getAllCategories } from '@/lib/contentstack'
import { resolveLocale } from '@/lib/locale'
import BlogListClient from '@/components/BlogListClient'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ region: string; locale: string }>
  searchParams: Promise<{ live_preview?: string; locale?: string }>
}

export default async function BlogPage({ params, searchParams }: Props) {
  const { locale: pathLocale } = await params
  const { live_preview, locale: searchLocale } = await searchParams
  const locale = resolveLocale(pathLocale, searchLocale)
  const [posts, categories] = await Promise.all([
    getAllPosts(live_preview, locale),
    getAllCategories(live_preview, locale),
  ])

  return (
    <section className="section">
      <div className="section__head">
        <h1>Articles</h1>
        <p className="section__sub">Everything we’ve published, filterable by topic.</p>
      </div>
      <BlogListClient posts={posts} categories={categories} />
    </section>
  )
}
