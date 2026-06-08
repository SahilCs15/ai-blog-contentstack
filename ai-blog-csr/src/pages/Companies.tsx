import { Link } from 'react-router-dom'
import Catalog from '../components/Catalog'
import type { AiCompany } from '../lib/hub-types'
import { edit } from '../lib/cslp'
import { imageUrl } from '../lib/format'

export default function Companies() {
  return (
    <Catalog<AiCompany>
      ct="ai_company"
      title="AI Companies"
      subtitle={(n) => `${n} organizations shaping the AI landscape.`}
      searchKeys={(c) => [c.title, c.description || '', c.industry || '']}
      renderCard={(c) => (
        <Link to={`/companies/${c.slug ?? c.uid}`} className="company-card" key={c.uid}>
          {c.logo?.url && <img className="company-card__logo" src={imageUrl(c.logo.url, 96)} alt={c.title} {...edit(c.logo.$, 'url')} />}
          <div>
            <h3 {...edit(c.$, 'title')}>{c.title}</h3>
            {c.industry && <span className="pill">{c.industry}</span>}
            {c.description && <p {...edit(c.$, 'description')}>{c.description}</p>}
            <div className="company-card__meta">
              {c.founded_year && <span>Founded {c.founded_year}</span>}
              {c.headquarters && <span>· {c.headquarters}</span>}
            </div>
          </div>
        </Link>
      )}
      columns={2}
    />
  )
}
