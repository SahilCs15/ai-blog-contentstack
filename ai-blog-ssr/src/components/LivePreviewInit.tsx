'use client'

// Client bootstrap for SSR live preview.
//
// In SSR mode the page HTML is produced on the server, so when an editor
// changes a field we must re-run the server render. ContentstackLivePreview
// (ssr: true) gives us an onEntryChange hook; we respond by syncing the
// live_preview hash into the URL and calling router.refresh(), which re-invokes
// the server components with the new hash.

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { config } from '@/lib/config'

export default function LivePreviewInit() {
  const router = useRouter()
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    let dispose = () => {}

    async function init() {
      const ContentstackLivePreview = (await import('@contentstack/live-preview-utils')).default

      ContentstackLivePreview.init({
        ssr: true,
        enable: true,
        stackDetails: {
          apiKey: config.apiKey,
          environment: config.environment,
        },
        clientUrlParams: {
          host: config.appHost,
        },
        editButton: { enable: true },
      })

      // Keep the live_preview hash in the URL so server fetches use it.
      const syncHashThenRefresh = () => {
        const hash = (ContentstackLivePreview as unknown as { hash?: string }).hash
        const url = new URL(window.location.href)
        if (hash && url.searchParams.get('live_preview') !== hash) {
          url.searchParams.set('live_preview', hash)
          window.history.replaceState({}, '', url.toString())
        }
        router.refresh()
      }

      ContentstackLivePreview.onEntryChange(syncHashThenRefresh)
    }

    init()
    return () => dispose()
  }, [router])

  return null
}
