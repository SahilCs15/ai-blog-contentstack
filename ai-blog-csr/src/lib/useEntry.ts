// useEntry: load data via the Live Preview onEntryChange subscription.
//
// The LP SDK calls onEntryChange once immediately on registration AND on every
// edit. Driving the load from that callback (instead of a separate up-front
// fetch) guarantees that inside the Visual Builder iframe the fetch carries the
// live_preview hash — which is what makes preview data appear. Outside preview
// the callback still fires once, so normal page loads work identically.

import { useCallback, useEffect, useRef, useState } from 'react'
import { onLivePreviewChange } from './contentstack'
import { useLocale } from './useLocale'
import { toCsError, type CsErrorDetail } from './cs-error'

interface State<T> {
  data: T | null
  loading: boolean
  error: CsErrorDetail | null
}

export function useEntry<T>(loader: (locale: string) => Promise<T>, deps: unknown[] = []): State<T> {
  const [state, setState] = useState<State<T>>({ data: null, loading: true, error: null })
  const loaderRef = useRef(loader)
  loaderRef.current = loader

  // The active locale is the single source of truth: useEntry passes it INTO the
  // loader and also keys the fetch on it, so a locale switch re-runs the loader
  // with the new locale. Loaders no longer resolve the locale themselves.
  const locale = useLocale()
  const allDeps = [...deps, locale]

  const run = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const data = await loaderRef.current(locale)
      setState({ data, loading: false, error: null })
    } catch (e) {
      // Loaders throw CsErrorDetail already; toCsError is a safety net for anything else.
      const detail = (e && typeof e === 'object' && 'message' in e && 'context' in e)
        ? (e as CsErrorDetail)
        : toCsError(e)
      setState({ data: null, loading: false, error: detail })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, allDeps)

  useEffect(() => {
    let fired = false
    const unsubscribe = onLivePreviewChange(() => {
      fired = true
      run()
    })
    // Safety net: if the SDK didn't invoke the callback on registration
    // (older versions / outside the iframe), kick off the initial load.
    const t = setTimeout(() => {
      if (!fired) run()
    }, 50)
    return () => {
      clearTimeout(t)
      unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, allDeps)

  return state
}
