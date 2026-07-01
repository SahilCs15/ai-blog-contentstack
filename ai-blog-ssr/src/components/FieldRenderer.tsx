// Universal field renderer (SSR). Identical logic to the CSR renderer; this is
// a server component (presentational only). Walks every field via inferFields
// and renders a labelled row per field, carrying data-cslp for Live Preview.

import type { JSX } from 'react'
import { inferFields, labelFor, kindLabel, type RenderField } from '@/lib/fields'
import { Rte } from '@/lib/rte'
import { imageUrl, formatDate } from '@/lib/format'

interface Asset {
  url?: string
  title?: string
  filename?: string
  content_type?: string
}

function cslp(tag?: string) {
  return tag ? { 'data-cslp': tag } : {}
}

function AssetView({ a }: { a: Asset }) {
  const isImage = (a.content_type || '').startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/i.test(a.url || '')
  return (
    <div className="af-asset">
      {isImage && a.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="af-asset__img" src={imageUrl(a.url, 320)} alt={a.title || a.filename || ''} />
      ) : null}
      <div className="af-asset__meta">
        <span>{a.filename || a.title || 'asset'}</span>
        {a.content_type ? <span className="af-muted"> · {a.content_type}</span> : null}
        {a.url ? (
          <a className="af-asset__link" href={a.url} target="_blank" rel="noreferrer">open</a>
        ) : null}
      </div>
    </div>
  )
}

// A referenced entry that itself holds resolved references (e.g. a blog_post
// with author/category). Lists each nested reference under the parent.
function nestedRefsOf(o: Record<string, unknown>): { field: string; items: Record<string, unknown>[] }[] {
  const out: { field: string; items: Record<string, unknown>[] }[] = []
  for (const [k, v] of Object.entries(o)) {
    if (k.startsWith('_') || k === 'system' || k === '$') continue
    const arr = Array.isArray(v) ? v : v ? [v] : []
    const items = arr.filter((x) => x && typeof x === 'object' && (('_content_type_uid' in (x as object)) || ('title' in (x as object) && 'uid' in (x as object)))) as Record<string, unknown>[]
    if (items.length) out.push({ field: k, items })
  }
  return out
}

function ReferenceView({ refs }: { refs: unknown[] }) {
  return (
    <ul className="af-list">
      {refs.map((r, i) => {
        const o = (r ?? {}) as Record<string, unknown>
        const ct = (o._content_type_uid as string) || (o.system as Record<string, unknown>)?.['content_type_uid']
        const title = (o.title as string) || (o.uid as string) || '(entry)'
        const nested = nestedRefsOf(o)
        return (
          <li key={i}>
            <span className="af-chip">{String(ct ?? 'ref')}</span> {title}
            {nested.map((n) => (
              <div className="af-nested" key={n.field}>
                <span className="af-nested__label af-muted">↳ {labelFor(n.field)}:</span>
                <ReferenceView refs={n.items} />
              </div>
            ))}
          </li>
        )
      })}
    </ul>
  )
}

// Embedded entries/assets resolved from a JSON RTE doc's _embedded_items.
function EmbeddedItems({ items }: { items: unknown[] }) {
  return (
    <div className="af-embeds">
      <div className="af-embeds__label">Embedded items ({items.length})</div>
      {items.map((it, i) => {
        const o = (it ?? {}) as Record<string, unknown>
        const isAssetItem = o._content_type_uid === 'sys_assets' || isAsset(o)
        return (
          <div className="af-embed" key={i}>
            {isAssetItem ? (
              <AssetView a={o as Asset} />
            ) : (
              <>
                <span className="af-chip">{String(o._content_type_uid ?? 'entry')}</span>{' '}
                {String(o.title ?? o.uid ?? '(entry)')}
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

function isAsset(v: unknown): boolean {
  return !!v && typeof v === 'object' && typeof (v as { url?: unknown }).url === 'string'
}

function Blocks({ blocks }: { blocks: unknown[] }) {
  return (
    <div className="af-blocks">
      {blocks.map((b, i) => {
        const obj = (b ?? {}) as Record<string, unknown>
        const type = Object.keys(obj)[0]
        const inner = obj[type] as Record<string, unknown>
        return (
          <div className="af-block" key={i}>
            <div className="af-block__type">{labelFor(type)}</div>
            <FieldGrid fields={objectToFields(inner)} dense />
          </div>
        )
      })}
    </div>
  )
}

function GroupView({ value }: { value: Record<string, unknown> }) {
  return <FieldGrid fields={objectToFields(value)} dense />
}

function objectToFields(obj: Record<string, unknown> | undefined): RenderField[] {
  return inferFields(obj as Record<string, unknown>)
}

/**
 * Last-resort presenter for any value the specific views don't cover. Renders
 * objects as nested labelled rows and arrays as a stacked list — recursively —
 * so a raw JSON dump is never shown to the user.
 */
function AnyView({ value }: { value: unknown }): JSX.Element {
  if (value === null || value === undefined) return <span className="af-muted">—</span>
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="af-muted">(empty)</span>
    return (
      <div className="af-anylist">
        {value.map((v, i) => (
          <div className="af-anylist__item" key={i}>
            <AnyView value={v} />
          </div>
        ))}
      </div>
    )
  }
  if (typeof value === 'object') {
    const fields = objectToFields(value as Record<string, unknown>)
    if (fields.length === 0) return <span className="af-muted">—</span>
    return <FieldGrid fields={fields} dense />
  }
  if (typeof value === 'boolean') {
    return <span className={`af-bool af-bool--${value ? 'on' : 'off'}`}>{value ? 'true' : 'false'}</span>
  }
  return <span style={{ whiteSpace: 'pre-wrap' }}>{String(value)}</span>
}

function ValueView({ field }: { field: RenderField }): JSX.Element {
  const { kind, value } = field
  switch (kind) {
    case 'boolean':
      return <span className={`af-bool af-bool--${value ? 'on' : 'off'}`}>{value ? 'true' : 'false'}</span>
    case 'number':
      return <span className="af-mono">{String(value)}</span>
    case 'date':
      return <span>{formatDate(String(value))} <span className="af-muted">({String(value)})</span></span>
    case 'string':
      return <span style={{ whiteSpace: 'pre-wrap' }}>{String(value)}</span>
    case 'stringList':
      return (
        <div className="af-chips">
          {(value as unknown[]).map((v, i) => <span className="af-chip" key={i}>{String(v)}</span>)}
        </div>
      )
    case 'richtext':
      return <div className="af-rte prose" dangerouslySetInnerHTML={{ __html: String(value) }} />
    case 'jsonRte': {
      const docObj = value as Record<string, unknown>
      const doc = docObj.json ?? value // GraphQL may wrap as { json }; REST is the doc itself
      const embedded = (docObj._embedded_items as Record<string, unknown[]> | undefined)?.json_rte
      return (
        <div className="af-rte prose">
          <Rte doc={doc} />
          {embedded?.length ? <EmbeddedItems items={embedded} /> : null}
        </div>
      )
    }
    case 'asset':
      return <AssetView a={value as Asset} />
    case 'assetList':
      return <div className="af-asset-grid">{(value as Asset[]).map((a, i) => <AssetView a={a} key={i} />)}</div>
    case 'reference':
      return <ReferenceView refs={value as unknown[]} />
    case 'link': {
      const l = value as { title?: string; href?: string }
      return <a href={l.href || '#'} target="_blank" rel="noreferrer">{l.title || l.href}</a>
    }
    case 'group':
      return <GroupView value={value as Record<string, unknown>} />
    case 'blocks':
      return <Blocks blocks={value as unknown[]} />
    default:
      return <AnyView value={value} />
  }
}

function FieldGrid({ fields, dense }: { fields: RenderField[]; dense?: boolean }) {
  return (
    <div className={`af-grid${dense ? ' af-grid--dense' : ''}`}>
      {fields.map((f) => (
        <div className="af-row" key={f.uid} data-field={f.uid}>
          <div className="af-row__head">
            <span className="af-row__name">{labelFor(f.uid)}</span>
            <span className="af-row__uid af-muted">{f.uid}</span>
            <span className="af-row__kind">{kindLabel(f.kind)}</span>
          </div>
          <div className="af-row__value" {...cslp(f.cslp)}>
            <ValueView field={f} />
          </div>
        </div>
      ))}
    </div>
  )
}

function EntryCard({ entry, index }: { entry: Record<string, unknown>; index: number }) {
  const fields = inferFields(entry)
  const titleCslp = (entry.$ as Record<string, { 'data-cslp'?: string }>)?.title?.['data-cslp']
  return (
    <div className="af-entry">
      <div className="af-entry__head">
        <span className="af-entry__index">Entry {index + 1}</span>
        {typeof entry.uid === 'string' ? <span className="af-entry__uid af-muted">{entry.uid}</span> : null}
        <span className="af-entry__count af-muted">{fields.length} fields</span>
      </div>
      {typeof entry.title === 'string' ? (
        <h2 className="af__title" {...cslp(titleCslp)}>{entry.title}</h2>
      ) : null}
      <FieldGrid fields={fields} />
    </div>
  )
}

export default function FieldRenderer({ entries, source }: { entries: Record<string, unknown>[]; source: string }) {
  if (!entries.length) return <div className="state"><h2>No entries returned</h2></div>
  return (
    <div className="af">
      <div className="af__bar">
        <span className="af__count">{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</span>
        <span className="af__source">{source}</span>
      </div>
      {entries.map((e, i) => <EntryCard entry={e} index={i} key={(e.uid as string) || i} />)}
    </div>
  )
}
