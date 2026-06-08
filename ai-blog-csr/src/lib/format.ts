// Small presentation helpers shared across components.

/** Append Contentstack image-API params for responsive, optimized delivery. */
export function imageUrl(url: string, width?: number): string {
  if (!url) return ''
  const u = new URL(url)
  u.searchParams.set('auto', 'webp')
  u.searchParams.set('quality', '80')
  if (width) u.searchParams.set('width', String(width))
  return u.toString()
}

export function formatDate(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
