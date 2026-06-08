import { Link } from 'react-router-dom'
import Catalog from '../components/Catalog'
import type { IndustryReport } from '../lib/hub-types'
import { edit } from '../lib/cslp'
import { formatDate } from '../lib/format'

export default function Reports() {
  return (
    <Catalog<IndustryReport>
      ct="industry_report"
      title="Industry Reports"
      subtitle={(n) => `${n} data-driven market reports.`}
      searchKeys={(r) => [r.title, r.summary || '']}
      renderCard={(r) => (
        <Link to={`/reports/${r.slug ?? r.uid}`} className="report-card" key={r.uid}>
          <h3 {...edit(r.$, 'title')}>{r.title}</h3>
          {r.summary && <p {...edit(r.$, 'summary')}>{r.summary}</p>}
          <div className="report-card__meta">
            {r.market_size && <span className="pill">{r.market_size}</span>}
            {r.published_date && <span>{formatDate(r.published_date)}</span>}
          </div>
        </Link>
      )}
      columns={2}
    />
  )
}
