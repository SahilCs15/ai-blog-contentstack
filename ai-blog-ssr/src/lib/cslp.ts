// Helpers to spread Contentstack live-preview edit tags (CSLP) onto elements.
// addEditableTags() populates entry.$ with { fieldUid: { 'data-cslp': '...' } }.
// edit(entry.$, 'title') -> { 'data-cslp': '...' } | {} so JSX can spread it.

import type { Cslp } from './types'

export function edit(
  tags: Cslp | undefined,
  field: string,
): { 'data-cslp'?: string; 'data-cs-instance'?: string } {
  const value = tags?.[field]?.['data-cslp']
  if (!value) return {}
  // A trailing index means the element IS one instance of a multiple field. The
  // marker lets CSS give it a hit band, else a child leaf takes every click.
  return /\.\d+$/.test(value) ? { 'data-cslp': value, 'data-cs-instance': '' } : { 'data-cslp': value }
}

/**
 * Container tag for a field that may be ABSENT from the entry payload.
 * addEditableTags only emits `$` entries for fields that have a value, so an
 * empty field can never be tagged, and Visual Builder then has nothing to
 * attach an "add instance" affordance to. The tag format is
 * `<content_type>.<entry_uid>.<locale>.<field>`, so borrow that prefix from any
 * tag the entry does carry and append the field.
 */
export function editField(
  entry: { $?: Cslp } | undefined,
  field: string,
): { 'data-cslp'?: string } {
  const existing = entry?.$?.[field]?.['data-cslp']
  if (existing) return { 'data-cslp': existing }
  const tags = entry?.$
  if (!tags) return {}
  for (const key of Object.keys(tags)) {
    const value = tags[key]?.['data-cslp']
    if (!value) continue
    const parts = value.split('.')
    if (parts.length >= 3) return { 'data-cslp': parts.slice(0, 3).join('.') + '.' + field }
  }
  return {}
}

/**
 * Container tag for a field that is absent from THIS object's tag map, built from
 * a sibling's path. An empty array gets no `$` entry, so without this the canvas
 * has nothing to attach an add-instance affordance to.
 */
export function editSibling(
  tags: Cslp | undefined,
  field: string,
): { 'data-cslp'?: string } {
  const direct = tags?.[field]?.['data-cslp']
  if (direct) return { 'data-cslp': direct }
  if (!tags) return {}
  for (const key of Object.keys(tags)) {
    if (key.includes('__')) continue
    const value = tags[key]?.['data-cslp']
    if (!value) continue
    const parts = value.split('.')
    parts[parts.length - 1] = field
    return { 'data-cslp': parts.join('.') }
  }
  return {}
}
