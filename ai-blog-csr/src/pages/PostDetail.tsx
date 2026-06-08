import { useCallback, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getPostBySlug } from '../lib/contentstack'
import { useEntry } from '../lib/useEntry'
import type { BlogPost, Author, Category } from '../lib/types'
import { one } from '../lib/types'
import { edit } from '../lib/cslp'
import { imageUrl, formatDate } from '../lib/format'
import { Rte } from '../lib/rte'
import Blocks from '../components/Blocks'
import { Loading, ErrorState, Empty } from '../components/States'

export default function PostDetail() {
  const { slug = '' } = useParams()
  const loader = useCallback(() => getPostBySlug(slug), [slug])
  const { data: post, loading, error } = useEntry<BlogPost | null>(loader, [slug])

  useEffect(() => {
    if (post?.seo?.meta_title || post?.title) {
      document.title = `${post.seo?.meta_title || post.title} · Synapse`
    }
  }, [post])

  if (loading && !post) return <Loading label="Loading article…" />
  if (error) return <ErrorState error={error} />
  if (!post) return <Empty title="Article not found" hint="It may be unpublished or the slug may be wrong." />

  const author = one<Author>(post.author)
  const category = one<Category>(post.category)
  const accent = category?.accent_color || '#6366f1'

  return (
    <article className="article">
      <div className="article__top" style={{ ['--accent' as string]: accent }}>
        <Link to="/blog" className="backlink">← All articles</Link>
        {category && (
          <span className="chip" style={{ ['--chip' as string]: accent }} {...edit(category.$, 'title')}>
            {category.title}
          </span>
        )}
        <h1 className="article__title" {...edit(post.$, 'title')}>{post.title}</h1>
        {post.excerpt && <p className="article__excerpt" {...edit(post.$, 'excerpt')}>{post.excerpt}</p>}

        <div className="byline">
          {author?.avatar?.url && (
            <img className="byline__avatar" src={imageUrl(author.avatar.url, 96)} alt={author.title} {...edit(author.avatar.$, 'url')} />
          )}
          <div>
            {author && <div className="byline__name" {...edit(author.$, 'title')}>{author.title}</div>}
            <div className="byline__meta">
              {author?.role && <span {...edit(author.$, 'role')}>{author.role}</span>}
              {post.published_date && <span> · {formatDate(post.published_date)}</span>}
              {post.read_time ? <span> · {post.read_time} min read</span> : null}
            </div>
          </div>
        </div>
      </div>

      {post.hero_image?.url && (
        <div className="article__hero">
          <img src={imageUrl(post.hero_image.url, 1400)} alt={post.title} {...edit(post.hero_image.$, 'url')} />
        </div>
      )}

      <div className="article__body prose">
        {post.body ? <Rte doc={post.body} /> : null}
        <Blocks blocks={post.blocks} />
      </div>

      {post.topics?.length ? (
        <div className="tags">
          {post.topics.map((t) => <span className="tag" key={t}>#{t}</span>)}
        </div>
      ) : null}

      {author?.bio && (
        <aside className="authorbox">
          {author.avatar?.url && <img src={imageUrl(author.avatar.url, 120)} alt={author.title} />}
          <div>
            <h3>{author.title}</h3>
            {author.role && <p className="authorbox__role">{author.role}</p>}
            <p {...edit(author.$, 'bio')}>{author.bio}</p>
          </div>
        </aside>
      )}
    </article>
  )
}
