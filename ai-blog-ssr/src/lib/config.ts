// Contentstack configuration for the SSR AI-blog app.
//
// Server-side fetches read these values; the client LivePreviewInit component
// reads the public NEXT_PUBLIC_* subset to bootstrap the live-preview SDK.
// All values come from env vars — copy .env.example to .env. No secrets in source.

function host(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

export const config = {
  apiKey: process.env.NEXT_PUBLIC_CS_API_KEY || '',
  deliveryToken: process.env.CS_DELIVERY_TOKEN || '',
  previewToken: process.env.NEXT_PUBLIC_CS_PREVIEW_TOKEN || '',
  environment: process.env.NEXT_PUBLIC_CS_ENVIRONMENT || 'development',
  cdnHost: host(process.env.CS_CDN_HOST || ''),
  previewHost: host(process.env.NEXT_PUBLIC_CS_PREVIEW_HOST || ''),
  appHost: host(process.env.NEXT_PUBLIC_CS_APP_HOST || ''),
  locale: process.env.NEXT_PUBLIC_CS_LOCALE || 'en-us',
} as const

export type AppConfig = typeof config
