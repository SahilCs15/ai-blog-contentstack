'use client'

// Locale-aware Link.
//
// All routes live under `/[locale]`, so an absolute `href="/tools"` must become
// `/<activeLocale>/tools` to keep the visitor (and the Visual Builder) in the
// current locale. This client wrapper reads the active locale from the current
// pathname and prefixes any absolute string href; relative or already-prefixed
// hrefs pass through. Components import Link from here instead of `next/link`,
// so existing `href="/..."` props need no change.

import NextLink, { type LinkProps } from 'next/link'
import { usePathname } from 'next/navigation'
import { type ComponentProps } from 'react'
import { DEFAULT_REGION } from '@/lib/regions'
import { defaultLocale, localeFromPath, regionFromPath } from '@/lib/locale-client'

type Props = Omit<ComponentProps<'a'>, 'href'> & LinkProps & { href: string }

export default function Link({ href, ...rest }: Props) {
  const pathname = usePathname()
  const region = regionFromPath(pathname) ?? DEFAULT_REGION
  const locale = localeFromPath(pathname) ?? defaultLocale

  let target = href
  if (typeof href === 'string' && href.startsWith('/')) {
    const base = `/${region}/${locale}`
    target = href === '/' ? base : `${base}${href}`
  }
  return <NextLink href={target} {...rest} />
}
