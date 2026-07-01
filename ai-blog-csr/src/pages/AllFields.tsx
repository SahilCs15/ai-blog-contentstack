// /all-fields (CSR) — REST Preview API.
//
// Fetches the single all_fields test entry client-side via useEntry (so the
// Live Preview onEntryChange hook re-fetches on edits and the first in-iframe
// load carries the live_preview hash). Renders every field dynamically.

import { useCallback } from 'react'
import { getAllFieldsEntries } from '../lib/contentstack'
import { useEntry } from '../lib/useEntry'
import FieldRenderer from '../components/FieldRenderer'
import { Loading, ErrorState } from '../components/States'

export default function AllFields() {
  const loader = useCallback((locale: string) => getAllFieldsEntries('all_fields', locale), [])
  const { data, loading, error } = useEntry<Record<string, unknown>[]>(loader)

  if (loading && !data) return <Loading label="Loading all fields…" />
  if (error) return <ErrorState error={error} />

  return (
    <section className="section">
      <div className="section__head">
        <h1>All Fields · REST Preview</h1>
        <p className="section__sub">
          Every field of every <code>all_fields</code> entry, rendered dynamically from the entry shape (client-side fetch).
        </p>
      </div>
      <FieldRenderer entries={data ?? []} source="REST Preview · client-side" />
    </section>
  )
}
