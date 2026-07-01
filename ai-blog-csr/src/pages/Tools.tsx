import { useCallback, useMemo, useState } from 'react'
import { getList } from '../lib/contentstack'
import { useEntry } from '../lib/useEntry'
import type { AiTool, AiCategory } from '../lib/hub-types'
import { one } from '../lib/types'
import ToolCard from '../components/ToolCard'
import { Loading, ErrorState, Empty } from '../components/States'

export default function Tools() {
  const loader = useCallback(async (locale: string) => {
    const [tools, cats] = await Promise.all([
      getList<AiTool>('ai_tool', { include: ['category', 'company'], limit: 100 }, locale),
      getList<AiCategory>('ai_category', { limit: 100 }, locale),
    ])
    return { tools: tools.items, total: tools.total, categories: cats.items }
  }, [])
  const { data, loading, error } = useEntry<{ tools: AiTool[]; total: number; categories: AiCategory[] }>(loader)
  const [active, setActive] = useState('all')
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    let list = data?.tools ?? []
    if (active !== 'all') list = list.filter((t) => one<AiCategory>(t.category)?.uid === active)
    if (q.trim()) {
      const needle = q.toLowerCase()
      list = list.filter((t) => t.title.toLowerCase().includes(needle) || t.short_description?.toLowerCase().includes(needle))
    }
    return list
  }, [data, active, q])

  if (loading && !data) return <Loading label="Loading AI tools…" />
  if (error) return <ErrorState error={error} />

  return (
    <section className="section">
      <div className="section__head">
        <h1>AI Tools Directory</h1>
        <p className="section__sub">{data?.total ?? 0} tools across {data?.categories.length ?? 0} categories.</p>
      </div>

      <input
        className="search"
        placeholder="Search tools…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="filterbar">
        <button className={`filter${active === 'all' ? ' is-active' : ''}`} onClick={() => setActive('all')}>All</button>
        {(data?.categories ?? []).map((c) => (
          <button
            key={c.uid}
            className={`filter${active === c.uid ? ' is-active' : ''}`}
            style={{ ['--chip' as string]: c.accent_color || '#6366f1' }}
            onClick={() => setActive(c.uid)}
          >
            {c.icon ? `${c.icon} ` : ''}{c.title}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Empty title="No tools match" hint="Try a different category or search term." />
      ) : (
        <div className="grid grid--3">
          {filtered.map((t) => <ToolCard tool={t} key={t.uid} />)}
        </div>
      )}
    </section>
  )
}
