import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getBySlug } from '../lib/contentstack'
import { useEntry } from '../lib/useEntry'
import type { Tutorial } from '../lib/hub-types'
import { edit } from '../lib/cslp'
import { Loading, ErrorState, Empty } from '../components/States'

export default function TutorialDetail() {
  const { slug = '' } = useParams()
  const loader = useCallback(() => getBySlug<Tutorial>('tutorial', slug, ['category']), [slug])
  const { data: t, loading, error } = useEntry<Tutorial | null>(loader, [slug])

  if (loading && !t) return <Loading label="Loading tutorial…" />
  if (error) return <ErrorState error={error} />
  if (!t) return <Empty title="Tutorial not found" />

  return (
    <article className="article">
      <Link to="/tutorials" className="backlink">← All tutorials</Link>
      <div className="tool-hero__meta">
        {t.difficulty && <span className={`pill pill--${(t.difficulty || '').toLowerCase()}`}>{t.difficulty}</span>}
        {t.read_time ? <span className="pill">{t.read_time} min</span> : null}
      </div>
      <h1 className="article__title" {...edit(t.$, 'title')}>{t.title}</h1>
      {t.introduction && <p className="article__excerpt" {...edit(t.$, 'introduction')}>{t.introduction}</p>}

      <ol className="steps">
        {(t.steps ?? []).map((s, i) => (
          <li className="step" key={i}>
            <div className="step__num">{i + 1}</div>
            <div>
              {s.heading && <h3 {...edit(s.$, 'heading')}>{s.heading}</h3>}
              {s.content && <p {...edit(s.$, 'content')}>{s.content}</p>}
            </div>
          </li>
        ))}
      </ol>

      {t.conclusion && (
        <div className="block block--callout callout--success">
          <strong>Conclusion</strong>
          <p {...edit(t.$, 'conclusion')}>{t.conclusion}</p>
        </div>
      )}
    </article>
  )
}
