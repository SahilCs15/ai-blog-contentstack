import { Link } from 'react-router-dom'
import Catalog from '../components/Catalog'
import type { UseCase } from '../lib/hub-types'
import { edit } from '../lib/cslp'

export default function UseCases() {
  return (
    <Catalog<UseCase>
      ct="use_case"
      title="Use Cases"
      subtitle={(n) => `${n} real-world AI applications by industry.`}
      searchKeys={(u) => [u.title, u.industry || '', u.problem || '']}
      renderCard={(u) => (
        <Link to={`/use-cases/${u.slug ?? u.uid}`} className="usecase-card" key={u.uid}>
          {u.industry && <span className="pill">{u.industry}</span>}
          <h3 {...edit(u.$, 'title')}>{u.title}</h3>
          {u.problem && <p className="usecase-card__problem" {...edit(u.$, 'problem')}><strong>Problem:</strong> {u.problem}</p>}
          {u.solution && <p {...edit(u.$, 'solution')}><strong>Solution:</strong> {u.solution}</p>}
        </Link>
      )}
      columns={2}
    />
  )
}
