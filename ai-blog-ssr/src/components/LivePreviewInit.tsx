'use client'

// Client bootstrap for SSR live preview.
//
// In SSR mode the page HTML is produced on the server, so when an editor
// changes a field we must re-run the server render. ContentstackLivePreview
// (ssr: true) gives us an onEntryChange hook; we respond by syncing the
// live_preview hash into the URL and calling router.refresh(), which re-invokes
// the server components with the new hash.

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { defaultLocale, localeFromPath, regionFromPath } from '@/lib/locale-client'

// Public, client-safe config for the active region (resolved server-side and
// passed down — the delivery token is never included here).
export interface LivePreviewConfig {
  apiKey: string
  environment: string
  previewToken: string
  previewHost: string
  appHost: string
}

export default function LivePreviewInit({ config }: { config: LivePreviewConfig }) {
  const router = useRouter()
  const pathname = usePathname()
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    const pathLocale = localeFromPath(pathname) ?? defaultLocale
    let dispose = () => {}

    async function init() {
      const ContentstackLivePreview = (await import('@contentstack/live-preview-utils')).default

      ContentstackLivePreview.init({
        ssr: true,
        enable: true,
        mode: 'builder',
        stackDetails: {
          apiKey: config.apiKey,
          environment: config.environment,
          // Seed the SDK with the locale the page was loaded in so it does not
          // fall back to its own default (en-us) and override the URL path.
          locale: pathLocale,
        },
        clientUrlParams: {
          host: config.appHost,
        },
        editButton: { enable: true },
      })

      // The `/[locale]/` path is the source of truth for locale. Keep the
      // live_preview hash in the URL for server fetches, and when the editor
      // switches locale in the Visual Builder, navigate the path to the new
      // locale rather than appending `?locale=` (which would fight the path).
      const syncHashThenRefresh = () => {
        const hash = (ContentstackLivePreview as unknown as { hash?: string }).hash
        const url = new URL(window.location.href)

        const builderLocale = (ContentstackLivePreview as unknown as { config?: { stackDetails?: { locale?: string } } })
          .config?.stackDetails?.locale
        if (builderLocale && localeFromPath(url.pathname) !== builderLocale) {
          // Path is `/{region}/{locale}/…`. Swap the locale segment, keep region.
          const region = regionFromPath(url.pathname)
          const segs = url.pathname.split('/').filter(Boolean)
          const rest = segs.slice(region ? 2 : 1)
          url.pathname = `/${region ? region + '/' : ''}${builderLocale}${rest.length ? '/' + rest.join('/') : ''}`
          if (hash) url.searchParams.set('live_preview', hash)
          router.replace(url.pathname + url.search)
          return
        }

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
  }, [router, pathname])

  return null
}
