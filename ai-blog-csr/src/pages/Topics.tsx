import { useCallback } from 'react'
import { Link } from '../lib/LocaleLink'
import { getAllCategories, getAllPosts } from '../lib/contentstack'
import { useEntry } from '../lib/useEntry'
import type { Category, BlogPost } from '../lib/types'
import { one } from '../lib/types'
import { edit } from '../lib/cslp'
import { Loading, ErrorState } from '../components/States'

export default function Topics() {
  const loader = useCallback(async (locale: string) => {
    const [categories, posts] = await Promise.all([getAllCategories(locale), getAllPosts(locale)])
    return { categories, posts }
  }, [])
  const { data, loading, error } = useEntry<{ categories: Category[]; posts: BlogPost[] }>(loader)

  if (loading && !data) return <Loading label="Loading topics…" />
  if (error) return <ErrorState error={error} />

  const count = (catUid: string) =>
    (data?.posts ?? []).filter((p) => one<Category>(p.category)?.uid === catUid).length

  return (
    <section className="section">
      <div className="section__head">
        <h1>Topics</h1>
        <p className="section__sub">Browse the journal by area of coverage.</p>
      </div>
      <div className="grid grid--2">
        {(data?.categories ?? []).map((c) => (
          <Link to="/blog" key={c.uid} className="topic" style={{ ['--chip' as string]: c.accent_color || '#6366f1' }}>
            <span className="topic__dot" />
            <div>
              <h3 {...edit(c.$, 'title')}>{c.title}</h3>
              {c.description && <p {...edit(c.$, 'description')}>{c.description}</p>}
              <span className="topic__count">{count(c.uid)} article{count(c.uid) === 1 ? '' : 's'}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
