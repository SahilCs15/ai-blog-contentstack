// /graphql (CSR) — resolves the entry whose `url` field is "/graphql" and loads
// it through the GraphQL Preview API (where: { url }). With a Live Preview hash
// (inside Visual Builder) the query hits the GraphQL preview host → draft data;
// otherwise the GraphQL delivery host → published. onEntryChange re-fetches.

import { useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { fetchAllFieldsByUrl } from '../lib/graphql'
import { livePreviewHash } from '../lib/contentstack'
import { stripLocaleFromPath } from '../lib/locale'
import { useEntry } from '../lib/useEntry'
import FieldRenderer from '../components/FieldRenderer'
import { Loading, ErrorState, Empty } from '../components/States'

interface Result {
  entry: Record<string, unknown> | null
  usedPreview: boolean
  errors?: string[]
}

export default function GraphqlFields() {
  const { pathname } = useLocation()
  // The entry's `url` field has no locale prefix (e.g. "/graphql"), so match
  // against the locale-stripped path even when the route is "/es/graphql".
  const entryUrl = stripLocaleFromPath(pathname)
  const loader = useCallback((locale: string) => fetchAllFieldsByUrl(entryUrl, livePreviewHash(), locale), [entryUrl])
  const { data, loading, error } = useEntry<Result>(loader, [entryUrl])

  if (loading && !data) return <Loading label="Resolving entry via GraphQL…" />
  if (error) return <ErrorState error={error} />
  if (data?.errors?.length) {
    return (
      <section className="section">
        <div className="section__head"><h1>GraphQL · errors</h1></div>
        <ul className="af-list">{data.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
      </section>
    )
  }

  return (
    <section className="section">
      <div className="section__head">
        <h1>GraphQL-routed Entry</h1>
        <p className="section__sub">
          The entry whose <code>url</code> field is <code>{pathname}</code>, resolved by URL and loaded via the Contentstack <strong>GraphQL Preview API</strong> (client-side).
        </p>
      </div>
      {data?.entry ? (
        <FieldRenderer
          entries={[data.entry]}
          source={`GraphQL · where url=${pathname} · ${data.usedPreview ? 'preview host (draft)' : 'delivery host (published)'} · client-side`}
        />
      ) : (
        <Empty title={`No entry found for ${pathname}`} hint="Run the setup script to create the all_fields entry whose url field is /graphql." />
      )}
    </section>
  )
}
