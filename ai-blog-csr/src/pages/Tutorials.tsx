import { Link } from '../lib/LocaleLink'
import Catalog from '../components/Catalog'
import type { Tutorial } from '../lib/hub-types'
import { edit } from '../lib/cslp'

export default function Tutorials() {
  return (
    <Catalog<Tutorial>
      ct="tutorial"
      title="Tutorials"
      subtitle={(n) => `${n} step-by-step guides for building with AI.`}
      searchKeys={(t) => [t.title, t.introduction || '']}
      renderCard={(t) => (
        <Link to={`/tutorials/${t.slug ?? t.uid}`} className="tutorial-card" key={t.uid}>
          <div className="tutorial-card__top">
            {t.difficulty && <span className={`pill pill--${(t.difficulty || '').toLowerCase()}`}>{t.difficulty}</span>}
            {t.read_time ? <span className="tutorial-card__time">{t.read_time} min</span> : null}
          </div>
          <h3 {...edit(t.$, 'title')}>{t.title}</h3>
          {t.introduction && <p {...edit(t.$, 'introduction')}>{t.introduction}</p>}
          <span className="tutorial-card__steps">{t.steps?.length ?? 0} steps</span>
        </Link>
      )}
    />
  )
}
