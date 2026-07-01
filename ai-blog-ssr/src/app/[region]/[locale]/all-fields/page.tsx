// /all-fields (SSR) — REST Preview API, server-side.
//
// The entry is fetched on the server with the live_preview hash from the URL
// (set by LivePreviewInit inside Visual Builder). Live Preview re-renders flow
// through router.refresh() → this server component re-runs. Rendering is fully
// dynamic from the entry shape, so new fields appear without code changes.

import { getAllFieldsEntries } from '@/lib/contentstack'
import { resolveLocale } from '@/lib/locale'
import { safeFetch } from '@/lib/safe-fetch'
import FieldRenderer from '@/components/FieldRenderer'
import { ErrorState } from '@/components/States'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ region: string; locale: string }>
  searchParams: Promise<{ live_preview?: string; locale?: string }>
}

export default async function AllFieldsPage({ params, searchParams }: Props) {
  const { locale: pathLocale } = await params
  const { live_preview, locale: searchLocale } = await searchParams
  const locale = resolveLocale(pathLocale, searchLocale)
  const { data, error } = await safeFetch(() => getAllFieldsEntries(live_preview, 'all_fields', locale))

  return (
    <section className="section">
      <div className="section__head">
        <h1>All Fields · REST Preview</h1>
        <p className="section__sub">
          Every field of every <code>all_fields</code> entry, rendered dynamically from the entry shape (server-side fetch).
        </p>
      </div>
      {error ? <ErrorState error={error} /> : <FieldRenderer entries={data ?? []} source="REST Preview · server-side" />}
    </section>
  )
}
