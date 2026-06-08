'use client'

import { useMemo, useState } from 'react'
import type { BlogPost, Category } from '@/lib/types'
import { one } from '@/lib/types'
import PostCard from './PostCard'
import { Empty } from './States'

// Server fetches the posts + categories; this client island only handles the
// topic filter so the initial render stays fully server-side (and live-preview
// re-renders flow through router.refresh on the server).
export default function BlogListClient({ posts, categories }: { posts: BlogPost[]; categories: Category[] }) {
  const [active, setActive] = useState<string>('all')

  const filtered = useMemo(() => {
    if (active === 'all') return posts
    return posts.filter((p) => one<Category>(p.category)?.uid === active)
  }, [posts, active])

  return (
    <>
      <div className="filterbar">
        <button className={`filter${active === 'all' ? ' is-active' : ''}`} onClick={() => setActive('all')}>
          All
        </button>
        {categories.map((c) => (
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
    </>
  )
}
