import Link from 'next/link'
import type { BlogPost, Author, Category } from '@/lib/types'
import { one } from '@/lib/types'
import { edit } from '@/lib/cslp'
import { imageUrl, formatDate } from '@/lib/format'

export default function PostCard({ post }: { post: BlogPost }) {
  const author = one<Author>(post.author)
  const category = one<Category>(post.category)
  const accent = category?.accent_color || '#6366f1'
  const href = `/blog/${post.slug ?? post.uid}`

  return (
    <article className="post-card">
      <Link href={href} className="post-card__media">
        {post.hero_image?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl(post.hero_image.url, 800)} alt={post.title} loading="lazy" {...edit(post.hero_image.$, 'url')} />
        ) : (
          <div className="post-card__placeholder" />
        )}
      </Link>
      <div className="post-card__body">
        {category && (
          <span className="chip" style={{ ['--chip' as string]: accent }} {...edit(category.$, 'title')}>
            {category.title}
          </span>
        )}
        <h3 className="post-card__title">
          <Link href={href} {...edit(post.$, 'title')}>{post.title}</Link>
        </h3>
        {post.excerpt && <p className="post-card__excerpt" {...edit(post.$, 'excerpt')}>{post.excerpt}</p>}
        <div className="post-card__meta">
          {author?.title && <span {...edit(author.$, 'title')}>{author.title}</span>}
          {post.published_date && <span>· {formatDate(post.published_date)}</span>}
          {post.read_time ? <span>· {post.read_time} min read</span> : null}
        </div>
      </div>
    </article>
  )
}
