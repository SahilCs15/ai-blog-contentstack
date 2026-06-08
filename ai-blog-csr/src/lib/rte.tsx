// Minimal JSON-RTE renderer. Contentstack's JSON RTE is a tree of nodes with a
// `type` and `children`. We render the common node types to React elements.
// This keeps the dependency surface small while supporting headings, lists,
// links, inline marks, images, and code.

import type { JSX, ReactNode } from 'react'

interface RteNode {
  type?: string
  text?: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  code?: boolean
  attrs?: Record<string, unknown>
  children?: RteNode[]
  uid?: string
}

function renderText(node: RteNode, key: string): ReactNode {
  let el: ReactNode = node.text ?? ''
  if (node.bold) el = <strong key={key + 'b'}>{el}</strong>
  if (node.italic) el = <em key={key + 'i'}>{el}</em>
  if (node.underline) el = <u key={key + 'u'}>{el}</u>
  if (node.strikethrough) el = <s key={key + 's'}>{el}</s>
  if (node.code) el = <code key={key + 'c'} className="rte-code">{el}</code>
  return <span key={key}>{el}</span>
}

function children(node: RteNode, key: string): ReactNode[] {
  return (node.children ?? []).map((c, i) => renderNode(c, `${key}.${i}`))
}

function renderNode(node: RteNode, key: string): ReactNode {
  if (node.text !== undefined) return renderText(node, key)
  const attrs = (node.attrs ?? {}) as Record<string, string>

  switch (node.type) {
    case 'p':
      return <p key={key}>{children(node, key)}</p>
    case 'h1':
      return <h1 key={key}>{children(node, key)}</h1>
    case 'h2':
      return <h2 key={key}>{children(node, key)}</h2>
    case 'h3':
      return <h3 key={key}>{children(node, key)}</h3>
    case 'h4':
      return <h4 key={key}>{children(node, key)}</h4>
    case 'ol':
      return <ol key={key}>{children(node, key)}</ol>
    case 'ul':
      return <ul key={key}>{children(node, key)}</ul>
    case 'li':
      return <li key={key}>{children(node, key)}</li>
    case 'blockquote':
      return <blockquote key={key}>{children(node, key)}</blockquote>
    case 'code':
      return <pre key={key} className="rte-pre"><code>{children(node, key)}</code></pre>
    case 'a':
      return (
        <a key={key} href={attrs.href || '#'} target="_blank" rel="noreferrer">
          {children(node, key)}
        </a>
      )
    case 'img':
      return <img key={key} src={attrs.url || attrs.src || ''} alt={String(attrs.alt || '')} className="rte-img" />
    case 'hr':
      return <hr key={key} />
    case 'doc':
      return <div key={key}>{children(node, key)}</div>
    default:
      return <div key={key}>{children(node, key)}</div>
  }
}

export function Rte({ doc }: { doc: unknown }): JSX.Element | null {
  if (!doc || typeof doc !== 'object') return null
  return <>{renderNode(doc as RteNode, 'rte')}</>
}
