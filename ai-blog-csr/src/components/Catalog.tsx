import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { getList } from '../lib/contentstack'
import { useEntry } from '../lib/useEntry'
import { Loading, ErrorState, Empty } from './States'

interface CatalogItem {
  uid: string
  title: string
}

interface Props<T extends CatalogItem> {
  ct: string
  title: string
  subtitle?: (n: number) => string
  include?: string[]
  searchKeys?: (t: T) => string[]
  renderCard: (item: T) => ReactNode
  columns?: 2 | 3
}

// Generic searchable list page used by companies, models, tutorials,
// comparisons, use cases, and reports.
export default function Catalog<T extends CatalogItem>({
  ct, title, subtitle, include, searchKeys, renderCard, columns = 3,
}: Props<T>) {
  const loader = useCallback(async () => {
    const res = await getList<T>(ct, { include, limit: 500 })
    return res.items
  }, [ct, include])
  const { data, loading, error } = useEntry<T[]>(loader, [ct])
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    let list = data ?? []
    if (q.trim()) {
      const n = q.toLowerCase()
      list = list.filter((t) => {
        const fields = searchKeys ? searchKeys(t) : [t.title]
        return fields.some((f) => (f || '').toLowerCase().includes(n))
      })
    }
    return list
  }, [data, q, searchKeys])

  if (loading && !data) return <Loading label={`Loading ${title.toLowerCase()}…`} />
  if (error) return <ErrorState message={error} />

  return (
    <section className="section">
      <div className="section__head">
        <h1>{title}</h1>
        {subtitle && <p className="section__sub">{subtitle(data?.length ?? 0)}</p>}
      </div>
      <input className="search" placeholder={`Search ${title.toLowerCase()}…`} value={q} onChange={(e) => setQ(e.target.value)} />
      {filtered.length === 0 ? (
        <Empty title="Nothing matches" />
      ) : (
        <div className={`grid grid--${columns}`}>
          {filtered.map((item) => renderCard(item))}
        </div>
      )}
    </section>
  )
}
