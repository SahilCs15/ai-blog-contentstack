// Region + locale-aware Link / NavLink.
//
// All routes live under `/:region/:locale`, so an absolute `to="/tools"` must
// become `/<region>/<locale>/tools` to keep the visitor (and the Visual Builder)
// in the current region and locale. These wrappers prefix any absolute string
// `to`; relative and non-string `to` values pass through untouched. Pages import
// Link/NavLink from here instead of react-router-dom, so existing `to="/..."`
// props need no change.

import { Link as RouterLink, NavLink as RouterNavLink, type LinkProps, type NavLinkProps } from 'react-router-dom'
import { useLocale, useRegion } from './useLocale'

function prefix(to: LinkProps['to'], region: string, locale: string): LinkProps['to'] {
  if (typeof to !== 'string') return to
  if (!to.startsWith('/')) return to // relative — leave as-is
  const base = `/${region}/${locale}`
  if (to === '/') return base
  return `${base}${to}`
}

export function Link({ to, ...rest }: LinkProps) {
  const region = useRegion()
  const locale = useLocale()
  return <RouterLink to={prefix(to, region, locale)} {...rest} />
}

export function NavLink({ to, ...rest }: NavLinkProps) {
  const region = useRegion()
  const locale = useLocale()
  return <RouterNavLink to={prefix(to, region, locale)} {...rest} />
}
