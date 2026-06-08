import { getAllPosts, getAllCategories } from '@/lib/contentstack'
import BlogListClient from '@/components/BlogListClient'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ live_preview?: string }>
}

export default async function BlogPage({ searchParams }: Props) {
  const { live_preview } = await searchParams
  const [posts, categories] = await Promise.all([
    getAllPosts(live_preview),
    getAllCategories(live_preview),
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
