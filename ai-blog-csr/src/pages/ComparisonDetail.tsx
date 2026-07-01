import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Link } from '../lib/LocaleLink'
import { getBySlug } from '../lib/contentstack'
import { useEntry } from '../lib/useEntry'
import type { Comparison } from '../lib/hub-types'
import { edit } from '../lib/cslp'
import { Loading, ErrorState, Empty } from '../components/States'

export default function ComparisonDetail() {
  const { slug = '' } = useParams()
  const loader = useCallback((locale: string) => getBySlug<Comparison>('comparison', slug, undefined, locale), [slug])
  const { data: c, loading, error } = useEntry<Comparison | null>(loader, [slug])

  if (loading && !c) return <Loading label="Loading comparison…" />
  if (error) return <ErrorState error={error} />
  if (!c) return <Empty title="Comparison not found" />

  return (
    <article className="article">
      <Link to="/compare" className="backlink">← All comparisons</Link>
      <h1 className="article__title" {...edit(c.$, 'title')}>{c.title}</h1>
      {c.overview && <p className="article__excerpt" {...edit(c.$, 'overview')}>{c.overview}</p>}

      {c.feature_comparison?.length ? (
        <div className="cmp-table-wrap">
          <table className="cmp-table">
            <thead>
              <tr><th>Feature</th><th>{c.tool_a}</th><th>{c.tool_b}</th></tr>
            </thead>
            <tbody>
              {c.feature_comparison.map((row, i) => (
                <tr key={i}>
                  <td>{row.feature}</td>
                  <td>{row.value_a}</td>
                  <td>{row.value_b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {c.pricing_comparison && (
        <div className="detail-list"><h3>Pricing</h3><p {...edit(c.$, 'pricing_comparison')}>{c.pricing_comparison}</p></div>
      )}
      {c.verdict && (
        <div className="block block--callout callout--info">
          <strong>Verdict</strong>
          <p {...edit(c.$, 'verdict')}>{c.verdict}</p>
        </div>
      )}
    </article>
  )
}
