import { useCallback, useMemo, useState } from 'react'
import { getAllPosts, getAllCategories } from '../lib/contentstack'
import { useEntry } from '../lib/useEntry'
import type { BlogPost, Category } from '../lib/types'
import { one } from '../lib/types'
import PostCard from '../components/PostCard'
import { Loading, ErrorState, Empty } from '../components/States'

export default function BlogList() {
  const loader = useCallback(async () => {
    const [posts, categories] = await Promise.all([getAllPosts(), getAllCategories()])
    return { posts, categories }
  }, [])
  const { data, loading, error } = useEntry<{ posts: BlogPost[]; categories: Category[] }>(loader)
  const [active, setActive] = useState<string>('all')

  const filtered = useMemo(() => {
    const posts = data?.posts ?? []
    if (active === 'all') return posts
    return posts.filter((p) => one<Category>(p.category)?.uid === active)
  }, [data, active])

  if (loading && !data) return <Loading label="Loading articles…" />
  if (error) return <ErrorState error={error} />

  return (
    <section className="section">
      <div className="section__head">
        <h1>Articles</h1>
        <p className="section__sub">Everything we’ve published, filterable by topic.</p>
      </div>

      <div className="filterbar">
        <button className={`filter${active === 'all' ? ' is-active' : ''}`} onClick={() => setActive('all')}>
          All
        </button>
        {(data?.categories ?? []).map((c) => (
          <button
            key={c.uid}
            className={`filter${active === c.uid ? ' is-active' : ''}`}
            style={{ ['--chip' as string]: c.accent_color || '#6366f1' }}
            onClick={() => setActive(c.uid)}
          >
            {c.title}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Empty title="No articles in this topic yet" />
      ) : (
        <div className="grid grid--3">
          {filtered.map((p) => <PostCard post={p} key={p.uid} />)}
        </div>
      )}
    </section>
  )
}
