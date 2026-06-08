import { Link } from 'react-router-dom'
import Catalog from '../components/Catalog'
import type { AiModel, AiCompany } from '../lib/hub-types'
import { one } from '../lib/types'
import { edit } from '../lib/cslp'

export default function Models() {
  return (
    <Catalog<AiModel>
      ct="ai_model"
      title="AI Models"
      subtitle={(n) => `${n} foundation and frontier models.`}
      include={['developer']}
      searchKeys={(m) => [m.title, m.description || '']}
      renderCard={(m) => {
        const dev = one<AiCompany>(m.developer)
        return (
          <Link to={`/models/${m.slug ?? m.uid}`} className="model-card" key={m.uid}>
            <h3 {...edit(m.$, 'title')}>{m.title}</h3>
            {dev?.title && <span className="model-card__dev">{dev.title}</span>}
            {m.description && <p {...edit(m.$, 'description')}>{m.description}</p>}
            <div className="model-card__meta">
              {m.context_window && <span className="pill">{m.context_window}</span>}
              {(m.modalities ?? []).slice(0, 3).map((x) => <span className="pill" key={x}>{x}</span>)}
            </div>
          </Link>
        )
      }}
    />
  )
}
