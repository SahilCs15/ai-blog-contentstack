import { redirect } from 'next/navigation'
import { DEFAULT_REGION } from '@/lib/regions'
import { defaultLocale } from '@/lib/locale-client'

// Every path carries `/{region}/{locale}`, so the bare root redirects to the
// default region + locale. (Middleware also handles this; this is the fallback.)
export default function RootPage() {
  redirect(`/${DEFAULT_REGION}/${defaultLocale}`)
}
