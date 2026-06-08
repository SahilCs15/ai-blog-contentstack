import type { Metadata } from 'next'
import Link from 'next/link'
import { getPostBySlug } from '@/lib/contentstack'
import type { Author, Category } from '@/lib/types'
import { one } from '@/lib/types'
import { edit } from '@/lib/cslp'
import { imageUrl, formatDate } from '@/lib/format'
import { Rte } from '@/lib/rte'
import Blocks from '@/components/Blocks'
import { Empty } from '@/components/States'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ live_preview?: string }>
}

// SSR-only superpower: real per-post meta tags rendered on the server.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return { title: 'Article not found · Synapse' }
  return {
    title: `${post.seo?.meta_title || post.title} · Synapse`,
    description: post.seo?.meta_description || post.excerpt,
    keywords: post.seo?.keywords,
    openGraph: {
      title: post.seo?.meta_title || post.title,
      description: post.seo?.meta_description || post.excerpt,
      images: post.hero_image?.url ? [imageUrl(post.hero_image.url, 1200)] : undefined,
    },
  }
}

export default async function PostPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { live_preview } = await searchParams
  const post = await getPostBySlug(slug, live_preview)

  if (!post) return <Empty title="Article not found" hint="It may be unpublished or the slug may be wrong." />

  const author = one<Author>(post.author)
  const category = one<Category>(post.category)
  const accent = category?.accent_color || '#6366f1'

  return (
    <article className="article">
      <div className="article__top" style={{ ['--accent' as string]: accent }}>
        <Link href="/blog" className="backlink">← All articles</Link>
        {category && (
          <span className="chip" style={{ ['--chip' as string]: accent }} {...edit(category.$, 'title')}>
            {category.title}
          </span>
        )}
        <h1 className="article__title" {...edit(post.$, 'title')}>{post.title}</h1>
        {post.excerpt && <p className="article__excerpt" {...edit(post.$, 'excerpt')}>{post.excerpt}</p>}

        <div className="byline">
          {author?.avatar?.url && (
            // eslint-disable-next-line @next/next/no-img-element
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
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
