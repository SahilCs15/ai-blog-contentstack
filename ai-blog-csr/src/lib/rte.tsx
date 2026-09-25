// Minimal JSON-RTE renderer. Contentstack's JSON RTE is a tree of nodes with a
// `type` and `children`. We render the common node types to React elements, plus
// embedded reference nodes (assets render inline as images; embedded entries
// render as a small product card from the resolved `embeds` map).

import type { JSX, ReactNode } from 'react'
import type { GuideEmbed } from './types'
import { imgLoading } from './img'

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

type Embeds = Record<string, GuideEmbed>

function imageParams(url: string, width: number): string {
  if (!url) return ''
  try {
    const u = new URL(url)
    u.searchParams.set('auto', 'webp')
    u.searchParams.set('quality', '80')
    u.searchParams.set('width', String(width))
    return u.toString()
  } catch {
    return url
  }
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

/** An embedded reference node: an asset (image) or an entry (product card). */
function renderEmbed(attrs: Record<string, string>, embeds: Embeds, key: string): ReactNode {
  if (attrs.type === 'asset') {
    const src = attrs['asset-link']
    if (!src) return null
    return (
      <figure className="rte-embed rte-embed--asset" key={key}>
        <img src={imageParams(src, 720)} alt={attrs['asset-name'] || ''} loading={imgLoading()} />
      </figure>
    )
  }
  if (attrs.type === 'entry') {
    const e = embeds[attrs['entry-uid']]
    if (!e) return null
    return (
      <a className="rte-embed rte-embed--entry" key={key} href="#products">
        {e.image?.url ? <img src={imageParams(e.image.url, 200)} alt={e.title || ''} loading={imgLoading()} /> : null}
        <span className="rte-embed__meta">
          <span className="rte-embed__kicker">Featured pick</span>
          <span className="rte-embed__title">{e.title}</span>
          {typeof e.price === 'number' ? <span className="rte-embed__price ss-num">${e.price.toFixed(2)}</span> : null}
        </span>
      </a>
    )
  }
  return null
}

function makeRenderer(embeds: Embeds) {
  const render = (node: RteNode, key: string): ReactNode => {
    if (node.text !== undefined) return renderText(node, key)
    const attrs = (node.attrs ?? {}) as Record<string, string>
    const kids = () => (node.children ?? []).map((c, i) => render(c, `${key}.${i}`))

    if (node.type === 'reference') return renderEmbed(attrs, embeds, key)

    switch (node.type) {
      case 'p':
        return <p key={key}>{kids()}</p>
      case 'h1':
        return <h1 key={key}>{kids()}</h1>
      case 'h2':
        return <h2 key={key}>{kids()}</h2>
      case 'h3':
        return <h3 key={key}>{kids()}</h3>
      case 'h4':
        return <h4 key={key}>{kids()}</h4>
      case 'ol':
        return <ol key={key}>{kids()}</ol>
      case 'ul':
        return <ul key={key}>{kids()}</ul>
      case 'li':
        return <li key={key}>{kids()}</li>
      case 'blockquote':
        return <blockquote key={key}>{kids()}</blockquote>
      case 'code':
        return <pre key={key} className="rte-pre"><code>{kids()}</code></pre>
      case 'a':
        return (
          <a key={key} href={attrs.href || '#'} target="_blank" rel="noreferrer">
            {kids()}
          </a>
        )
      case 'img':
        return <img key={key} src={attrs.url || attrs.src || ''} alt={String(attrs.alt || '')} className="rte-img" />
      case 'hr':
        return <hr key={key} />
      case 'doc':
        return <div key={key}>{kids()}</div>
      default:
        return <div key={key}>{kids()}</div>
    }
  }
  return render
}

export function Rte({ doc, embeds }: { doc: unknown; embeds?: Embeds }): JSX.Element | null {
  if (!doc || typeof doc !== 'object') return null
  const render = makeRenderer(embeds ?? {})
  return <>{render(doc as RteNode, 'rte')}</>
}
