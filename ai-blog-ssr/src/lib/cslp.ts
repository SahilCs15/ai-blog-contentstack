// Helpers to spread Contentstack live-preview edit tags (CSLP) onto elements.
// addEditableTags() populates entry.$ with { fieldUid: { 'data-cslp': '...' } }.
// edit(entry.$, 'title') -> { 'data-cslp': '...' } | {} so JSX can spread it.

import type { Cslp } from './types'

export function edit(tags: Cslp | undefined, field: string): { 'data-cslp'?: string } {
  const t = tags?.[field]
  return t?.['data-cslp'] ? { 'data-cslp': t['data-cslp'] } : {}
}
