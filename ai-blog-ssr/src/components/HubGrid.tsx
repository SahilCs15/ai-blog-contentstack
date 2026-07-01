'use client'

import { useMemo, useState } from 'react'
import Link from '@/components/LocaleLink'
import type {
  AiTool, AiCategory, AiCompany, AiModel, Tutorial, Comparison, UseCase, IndustryReport, GlossaryTerm, AiNews,
} from '@/lib/hub-types'
import { one } from '@/lib/types'
import { edit } from '@/lib/cslp'
import { imageUrl, formatDate } from '@/lib/format'
import ToolCard from './ToolCard'

type Kind = 'tool' | 'company' | 'model' | 'tutorial' | 'comparison' | 'usecase' | 'report' | 'glossary' | 'news'

// Client island: server passes the full fetched list; this handles search +
// optional category filter and renders the right card. Initial paint is still
// server-driven (the list is serialized into the HTML), and live-preview edits
// flow in via router.refresh re-running the server fetch.
export default function HubGrid({
  items, kind, categories, columns = 3,
}: {
  items: any[]
  kind: Kind
  categories?: AiCategory[]
  columns?: 2 | 3
}) {
  const [q, setQ] = useState('')
  const [active, setActive] = useState('all')

  const filtered = useMemo(() => {
    let list = items
    if (active !== 'all') list = list.filter((t) => one<AiCategory>(t.category)?.uid === active)
    if (q.trim()) {
      const n = q.toLowerCase()
      list = list.filter((t) =>
        [t.title, t.short_description, t.description, t.excerpt, t.overview, t.introduction, t.summary, t.definition, t.industry]
          .filter(Boolean)
          .some((f: string) => f.toLowerCase().includes(n))
      )
    }
    return list
  }, [items, q, active])

  return (
    <>
      <input className="search" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
      {categories?.length ? (
        <div className="filterbar">
          <button className={`filter${active === 'all' ? ' is-active' : ''}`} onClick={() => setActive('all')}>All</button>
          {categories.map((c) => (
            <button key={c.uid} className={`filter${active === c.uid ? ' is-active' : ''}`}
              style={{ ['--chip' as string]: c.accent_color || '#6366f1' }} onClick={() => setActive(c.uid)}>
              {c.icon ? `${c.icon} ` : ''}{c.title}
            </button>
          ))}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <div className="state"><h2>Nothing matches</h2></div>
      ) : (
        <div className={`grid grid--${columns}`}>
          {filtered.map((item) => <Card key={item.uid} item={item} kind={kind} />)}
        </div>
      )}
    </>
  )
}

function Card({ item, kind }: { item: any; kind: Kind }) {
  switch (kind) {
    case 'tool':
      return <ToolCard tool={item as AiTool} />
    case 'company': {
      const c = item as AiCompany
      return (
        <Link href={`/companies/${c.slug ?? c.uid}`} className="company-card">
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
      )
    }
    case 'model': {
      const m = item as AiModel
      const dev = one<AiCompany>(m.developer)
      return (
        <Link href={`/models/${m.slug ?? m.uid}`} className="model-card">
          <h3 {...edit(m.$, 'title')}>{m.title}</h3>
          {dev?.title && <span className="model-card__dev">{dev.title}</span>}
          {m.description && <p {...edit(m.$, 'description')}>{m.description}</p>}
          <div className="model-card__meta">
            {m.context_window && <span className="pill">{m.context_window}</span>}
            {(m.modalities ?? []).slice(0, 3).map((x) => <span className="pill" key={x}>{x}</span>)}
          </div>
        </Link>
      )
    }
    case 'tutorial': {
      const t = item as Tutorial
      return (
        <Link href={`/tutorials/${t.slug ?? t.uid}`} className="tutorial-card">
          <div className="tutorial-card__top">
            {t.difficulty && <span className={`pill pill--${(t.difficulty || '').toLowerCase()}`}>{t.difficulty}</span>}
            {t.read_time ? <span className="tutorial-card__time">{t.read_time} min</span> : null}
          </div>
          <h3 {...edit(t.$, 'title')}>{t.title}</h3>
          {t.introduction && <p {...edit(t.$, 'introduction')}>{t.introduction}</p>}
          <span className="tutorial-card__steps">{t.steps?.length ?? 0} steps</span>
        </Link>
      )
    }
    case 'comparison': {
      const c = item as Comparison
      return (
        <Link href={`/compare/${c.slug ?? c.uid}`} className="compare-card">
          <div className="compare-card__vs"><span>{c.tool_a}</span><em>vs</em><span>{c.tool_b}</span></div>
          <h3 {...edit(c.$, 'title')}>{c.title}</h3>
          {c.overview && <p {...edit(c.$, 'overview')}>{c.overview}</p>}
        </Link>
      )
    }
    case 'usecase': {
      const u = item as UseCase
      return (
        <Link href={`/use-cases/${u.slug ?? u.uid}`} className="usecase-card">
          {u.industry && <span className="pill">{u.industry}</span>}
          <h3 {...edit(u.$, 'title')}>{u.title}</h3>
          {u.problem && <p className="usecase-card__problem" {...edit(u.$, 'problem')}><strong>Problem:</strong> {u.problem}</p>}
          {u.solution && <p {...edit(u.$, 'solution')}><strong>Solution:</strong> {u.solution}</p>}
        </Link>
      )
    }
    case 'report': {
      const r = item as IndustryReport
      return (
        <Link href={`/reports/${r.slug ?? r.uid}`} className="report-card">
          <h3 {...edit(r.$, 'title')}>{r.title}</h3>
          {r.summary && <p {...edit(r.$, 'summary')}>{r.summary}</p>}
          <div className="report-card__meta">
            {r.market_size && <span className="pill">{r.market_size}</span>}
            {r.published_date && <span>{formatDate(r.published_date)}</span>}
          </div>
        </Link>
      )
    }
    case 'glossary': {
      const g = item as GlossaryTerm
      return (
        <div className="glossary-item">
          <h3 {...edit(g.$, 'title')}>{g.title}</h3>
          {g.definition && <p {...edit(g.$, 'definition')}>{g.definition}</p>}
        </div>
      )
    }
    case 'news': {
      const a = item as AiNews
      return (
        <article className="post-card">
          <Link href={`/news/${a.slug ?? a.uid}`} className="post-card__media">
            {a.featured_image?.url ? <img src={imageUrl(a.featured_image.url, 700)} alt={a.title} loading="lazy" {...edit(a.featured_image.$, 'url')} /> : <div className="post-card__placeholder" />}
          </Link>
          <div className="post-card__body">
            <h3 className="post-card__title"><Link href={`/news/${a.slug ?? a.uid}`} {...edit(a.$, 'title')}>{a.title}</Link></h3>
            {a.excerpt && <p className="post-card__excerpt" {...edit(a.$, 'excerpt')}>{a.excerpt}</p>}
            <div className="post-card__meta">
              {a.author && <span>{a.author}</span>}
              {a.published_date && <span>· {formatDate(a.published_date)}</span>}
            </div>
          </div>
        </article>
      )
    }
    default:
      return null
  }
}
