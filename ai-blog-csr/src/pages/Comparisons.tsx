import { Link } from 'react-router-dom'
import Catalog from '../components/Catalog'
import type { Comparison } from '../lib/hub-types'
import { edit } from '../lib/cslp'

export default function Comparisons() {
  return (
    <Catalog<Comparison>
      ct="comparison"
      title="Comparisons"
      subtitle={(n) => `${n} head-to-head breakdowns.`}
      searchKeys={(c) => [c.title, c.overview || '', c.tool_a || '', c.tool_b || '']}
      renderCard={(c) => (
        <Link to={`/compare/${c.slug ?? c.uid}`} className="compare-card" key={c.uid}>
          <div className="compare-card__vs">
            <span>{c.tool_a}</span>
            <em>vs</em>
            <span>{c.tool_b}</span>
          </div>
          <h3 {...edit(c.$, 'title')}>{c.title}</h3>
          {c.overview && <p {...edit(c.$, 'overview')}>{c.overview}</p>}
        </Link>
      )}
    />
  )
}
