import { useCallback, useMemo, useState } from 'react'
import { getList } from '../lib/contentstack'
import { useEntry } from '../lib/useEntry'
import type { GlossaryTerm } from '../lib/hub-types'
import { edit } from '../lib/cslp'
import { Loading, ErrorState, Empty } from '../components/States'

export default function Glossary() {
  const loader = useCallback(async () => {
    const res = await getList<GlossaryTerm>('glossary_term', { limit: 400 })
    return res.items
  }, [])
  const { data, loading, error } = useEntry<GlossaryTerm[]>(loader)
  const [q, setQ] = useState('')

  const grouped = useMemo(() => {
    let terms = data ?? []
    if (q.trim()) {
      const n = q.toLowerCase()
      terms = terms.filter((t) => t.title.toLowerCase().includes(n) || t.definition?.toLowerCase().includes(n))
    }
    const map = new Map<string, GlossaryTerm[]>()
    for (const t of terms) {
      const letter = (t.letter || t.title[0] || '#').toUpperCase()
      if (!map.has(letter)) map.set(letter, [])
      map.get(letter)!.push(t)
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [data, q])

  if (loading && !data) return <Loading label="Loading glossary…" />
  if (error) return <ErrorState message={error} />

  return (
    <section className="section">
      <div className="section__head">
        <h1>AI Glossary</h1>
        <p className="section__sub">{data?.length ?? 0} terms explained in plain language.</p>
      </div>
      <input className="search" placeholder="Search terms…" value={q} onChange={(e) => setQ(e.target.value)} />

      {grouped.length === 0 ? (
        <Empty title="No terms match" />
      ) : (
        grouped.map(([letter, terms]) => (
          <div className="glossary-group" key={letter}>
            <h2 className="glossary-letter">{letter}</h2>
            <div className="glossary-grid">
              {terms.map((t) => (
                <div className="glossary-item" key={t.uid}>
                  <h3 {...edit(t.$, 'title')}>{t.title}</h3>
                  {t.definition && <p {...edit(t.$, 'definition')}>{t.definition}</p>}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </section>
  )
}
