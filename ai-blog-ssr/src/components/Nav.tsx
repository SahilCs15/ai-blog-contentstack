'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/tools', label: 'Tools' },
  { href: '/models', label: 'Models' },
  { href: '/companies', label: 'Companies' },
  { href: '/news', label: 'News' },
  { href: '/tutorials', label: 'Tutorials' },
  { href: '/glossary', label: 'Glossary' },
  { href: '/compare', label: 'Compare' },
  { href: '/use-cases', label: 'Use Cases' },
  { href: '/reports', label: 'Reports' },
  { href: '/blog', label: 'Blog' },
]

export default function Nav() {
  const pathname = usePathname()
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))

  return (
    <nav className="nav">
      {NAV.map((n) => (
        <Link key={n.href} href={n.href} className={`nav__link${isActive(n.href) ? ' is-active' : ''}`}>
          {n.label}
        </Link>
      ))}
    </nav>
  )
}
