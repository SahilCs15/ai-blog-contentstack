// /graphql (SSR) — GraphQL Preview API, server-side.
//
// Runs the generated all-fields GraphQL query on the server. With a
// live_preview hash from the URL (Visual Builder) it hits the GraphQL preview
// host (draft); otherwise the GraphQL delivery host (published). Live Preview
// re-renders flow through router.refresh() → this server component re-runs.

import { fetchAllFieldsByUrl } from '@/lib/graphql'
import { resolveLocale } from '@/lib/locale'
import FieldRenderer from '@/components/FieldRenderer'
import { Empty } from '@/components/States'

export const dynamic = 'force-dynamic'

// This page IS the entry whose `url` field is "/graphql": it resolves that
// entry by its url through the GraphQL Preview API (where: { url }), so opening
// /graphql loads exactly that entry's data over GraphQL.
const THIS_URL = '/graphql'

interface Props {
  params: Promise<{ region: string; locale: string }>
  searchParams: Promise<{ live_preview?: string; locale?: string }>
}

export default async function GraphqlPage({ params, searchParams }: Props) {
  const { locale: pathLocale } = await params
  const { live_preview, locale: searchLocale } = await searchParams
  const locale = resolveLocale(pathLocale, searchLocale)
  const { entry, usedPreview, errors } = await fetchAllFieldsByUrl(THIS_URL, live_preview, locale)

  return (
    <section className="section">
      <div className="section__head">
        <h1>GraphQL-routed Entry</h1>
        <p className="section__sub">
          The entry whose <code>url</code> field is <code>/graphql</code>, resolved by URL and loaded via the Contentstack <strong>GraphQL Preview API</strong> (server-side).
        </p>
      </div>

      {errors?.length ? (
        <ul className="af-list">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
      ) : entry ? (
        <FieldRenderer entries={[entry]} source={`GraphQL · where url=${THIS_URL} · ${usedPreview ? 'preview host (draft)' : 'delivery host (published)'} · server-side`} />
      ) : (
        <Empty title="No entry found for /graphql" hint="Run the setup script to create the all_fields entry whose url field is /graphql." />
      )}
    </section>
  )
}
