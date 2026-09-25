/**
 * Image loading strategy.
 *
 * Inside the Visual Builder canvas the viewport is short while the page is very
 * tall, so native lazy loading leaves everything below the fold unloaded and the
 * canvas reads as full of blank image boxes. Load eagerly there, stay lazy on the
 * real site so it keeps its bandwidth win.
 */
export function imgLoading(): 'eager' | 'lazy' {
  if (typeof window === 'undefined') return 'lazy'
  try {
    const q = window.location.search
    const inBuilder =
      q.includes('builder=true') || q.includes('live_preview=') || window.self !== window.top
    return inBuilder ? 'eager' : 'lazy'
  } catch {
    return 'lazy'
  }
}
