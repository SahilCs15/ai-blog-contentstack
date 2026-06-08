// Central Contentstack configuration for the CSR AI-blog app.
//
// Values come from Vite env vars (VITE_*) when present, otherwise fall back to
// the dev23 stack the content was seeded into. Live preview is wired so the app
// works standalone AND inside the Contentstack Visual Builder / preview iframe.

function env(key: string): string {
  const v = (import.meta.env as Record<string, string | undefined>)[key]
  return v && v.length ? v : ''
}

function host(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

export const config = {
  apiKey: env('VITE_CS_API_KEY'),
  deliveryToken: env('VITE_CS_DELIVERY_TOKEN'),
  previewToken: env('VITE_CS_PREVIEW_TOKEN'),
  environment: env('VITE_CS_ENVIRONMENT') || 'development',
  // Region hosts (dev23 / csnonprod). For prod stacks these become
  // cdn.contentstack.io / rest-preview.contentstack.com etc.
  cdnHost: host(env('VITE_CS_CDN_HOST')),
  previewHost: host(env('VITE_CS_PREVIEW_HOST')),
  appHost: host(env('VITE_CS_APP_HOST')),
  locale: env('VITE_CS_LOCALE') || 'en-us',
} as const

export type AppConfig = typeof config
