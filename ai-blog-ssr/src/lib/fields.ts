// Schema-less field inference for the universal "all fields" test page.
//
// Rather than reading the content-type schema, this walks the entry JSON and
// infers a field's *kind* from its value shape. That keeps the renderer
// dependency-free at runtime and means a newly added field shows up
// automatically — no code change needed. The inferred `kind` drives how the
// renderer presents the value (RTE vs asset vs reference vs group, etc.).

export type FieldKind =
  | 'richtext' // HTML string from an RTE field
  | 'jsonRte' // Contentstack JSON RTE document
  | 'asset' // single file/asset object
  | 'assetList' // array of assets
  | 'reference' // array of referenced entries
  | 'link' // { title, href }
  | 'group' // nested object (group / global field)
  | 'blocks' // modular blocks (array of single-key objects)
  | 'boolean'
  | 'number'
  | 'date' // ISO date string
  | 'stringList' // multi-value text / select
  | 'string'
  | 'json' // any other object/array we render as JSON

export interface RenderField {
  uid: string
  kind: FieldKind
  value: unknown
  /** data-cslp edit tag for Live Preview, if present on the entry's `$` map. */
  cslp?: string
}

// Keys Contentstack adds to entries/assets/blocks that aren't editable content
// fields. Stripped at every level so nested objects (assets inside blocks,
// groups, etc.) show only meaningful fields — never internal plumbing.
const SYSTEM_KEYS = new Set([
  'uid', 'ACL', '_version', '_in_progress', '_metadata', '$',
  'created_at', 'updated_at', 'created_by', 'updated_by',
  'locale', 'tags', 'publish_details', 'title', // title is rendered as the page heading
  // asset internals
  'is_dir', 'parent_uid', 'file_size', 'dimension', '_metadata', 'permanent_url',
  'unique_identifier', 'content_type_uid',
])

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

/** A Contentstack asset has a url + a uid/filename. */
function isAsset(v: unknown): v is Record<string, unknown> {
  return isPlainObject(v) && typeof v.url === 'string' && ('filename' in v || 'uid' in v)
}

/** A referenced entry carries _content_type_uid (REST include) or a uid + title. */
function isReferenceEntry(v: unknown): boolean {
  return isPlainObject(v) && ('_content_type_uid' in v || ('uid' in v && 'title' in v))
}

/** JSON RTE document: an object with type === 'doc' (or children + type). */
function isJsonRte(v: unknown): boolean {
  return isPlainObject(v) && (v.type === 'doc' || (Array.isArray(v.children) && typeof v.type === 'string'))
}

/** Modular blocks: array of objects each with exactly one block-type key. */
function isBlocks(v: unknown): boolean {
  return (
    Array.isArray(v) &&
    v.length > 0 &&
    v.every((b) => isPlainObject(b) && Object.keys(b).length === 1 && isPlainObject(Object.values(b)[0]))
  )
}

/** HTML-ish string (from an RTE field) vs plain text. */
function looksLikeHtml(v: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(v)
}

function inferKind(value: unknown): FieldKind {
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'string') {
    if (ISO_DATE.test(value)) return 'date'
    if (looksLikeHtml(value)) return 'richtext'
    return 'string'
  }
  if (isJsonRte(value)) return 'jsonRte'
  if (isAsset(value)) return 'asset'
  if (Array.isArray(value)) {
    if (value.length === 0) return 'stringList'
    if (value.every((x) => typeof x === 'string')) return 'stringList'
    if (value.every(isAsset)) return 'assetList'
    if (value.every(isReferenceEntry)) return 'reference'
    if (isBlocks(value)) return 'blocks'
    return 'json'
  }
  if (isPlainObject(value)) {
    if (typeof value.href === 'string' && 'title' in value) return 'link'
    if (isReferenceEntry(value)) return 'reference'
    return 'group'
  }
  return 'json'
}

type CslpMap = Record<string, { 'data-cslp'?: string } | undefined> | undefined

/** Walk an entry into an ordered list of renderable fields. */
export function inferFields(entry: Record<string, unknown> | null | undefined): RenderField[] {
  if (!entry) return []
  const tags = entry.$ as CslpMap
  const out: RenderField[] = []
  for (const [uid, value] of Object.entries(entry)) {
    if (SYSTEM_KEYS.has(uid)) continue
    if (value === undefined || value === null) continue
    out.push({
      uid,
      kind: inferKind(value),
      value,
      cslp: tags?.[uid]?.['data-cslp'],
    })
  }
  return out
}

/** Human label for a field uid: snake_case -> Title Case. */
export function labelFor(uid: string): string {
  return uid
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/** A short human name for the inferred kind, shown as a type badge. */
export function kindLabel(kind: FieldKind): string {
  const map: Record<FieldKind, string> = {
    richtext: 'Rich Text (HTML)',
    jsonRte: 'JSON RTE',
    asset: 'Asset',
    assetList: 'Asset (multiple)',
    reference: 'Reference',
    link: 'Link',
    group: 'Group / Global',
    blocks: 'Modular Blocks',
    boolean: 'Boolean',
    number: 'Number',
    date: 'Date',
    stringList: 'Multi-value',
    string: 'Text',
    json: 'JSON',
  }
  return map[kind]
}
