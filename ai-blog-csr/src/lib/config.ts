// Central Contentstack configuration for the CSR AI-blog app.
//
// All values come from Vite env vars (VITE_*). Copy .env.example to .env and
// fill in your stack's credentials. No secrets are committed to source.

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
  // Region hosts. e.g. dev23-cdn.csnonprod.com, or cdn.contentstack.io for prod.
  cdnHost: host(env('VITE_CS_CDN_HOST')),
  previewHost: host(env('VITE_CS_PREVIEW_HOST')),
  appHost: host(env('VITE_CS_APP_HOST')),
  locale: env('VITE_CS_LOCALE') || 'en-us',
} as const

export type AppConfig = typeof config
