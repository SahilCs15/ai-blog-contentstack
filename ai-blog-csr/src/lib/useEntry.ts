// useEntry: load data via the Live Preview onEntryChange subscription.
//
// The LP SDK calls onEntryChange once immediately on registration AND on every
// edit. Driving the load from that callback (instead of a separate up-front
// fetch) guarantees that inside the Visual Builder iframe the fetch carries the
// live_preview hash — which is what makes preview data appear. Outside preview
// the callback still fires once, so normal page loads work identically.

import { useCallback, useEffect, useRef, useState } from 'react'
import { onLivePreviewChange } from './contentstack'

interface State<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useEntry<T>(loader: () => Promise<T>, deps: unknown[] = []): State<T> {
  const [state, setState] = useState<State<T>>({ data: null, loading: true, error: null })
  const loaderRef = useRef(loader)
  loaderRef.current = loader

  const run = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const data = await loaderRef.current()
      setState({ data, loading: false, error: null })
    } catch (e) {
      setState({ data: null, loading: false, error: e instanceof Error ? e.message : String(e) })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

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
  }, deps)

  return state
}
