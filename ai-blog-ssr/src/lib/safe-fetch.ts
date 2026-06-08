// Wraps a server-side fetch so SSR pages can render the API error on-page
// instead of throwing into Next's generic error boundary (which loses the
// structured Contentstack detail). Returns { data, error } — never throws.

import { toCsError, type CsErrorDetail } from './cs-error'

export async function safeFetch<T>(fn: () => Promise<T>): Promise<{ data: T | null; error: CsErrorDetail | null }> {
  try {
    return { data: await fn(), error: null }
  } catch (e) {
    const detail =
      e && typeof e === 'object' && 'message' in e && 'context' in e
        ? (e as CsErrorDetail)
        : toCsError(e)
    return { data: null, error: detail }
  }
}
