import type { Block, BlockData, CsAsset } from '../lib/types'
import { Rte } from '../lib/rte'
import { edit } from '../lib/cslp'
import { imageUrl } from '../lib/format'

// Renders the modular `blocks` field. Each block is a single-key object whose
// key is the block type. We render image, quote, callout, and rich_text.
export default function Blocks({ blocks }: { blocks?: Block[] }) {
  if (!blocks?.length) return null
  return (
    <div className="blocks">
      {blocks.map((block, i) => {
        const type = Object.keys(block).find((k) => k !== '_metadata')
        if (!type) return null
        const data = block[type] as BlockData | undefined
        if (!data) return null
        const tags = data.$

        switch (type) {
          case 'rich_text':
            return (
              <div className="block block--rte" key={i} {...edit(tags, 'text')}>
                <Rte doc={data.text} />
              </div>
            )
          case 'image': {
            const img = data.image as CsAsset | null | undefined
            return (
              <figure className="block block--image" key={i}>
                {img?.url && (
                  <img src={imageUrl(img.url, 1000)} alt={data.caption ?? ''} loading="lazy" {...edit(img.$, 'url')} />
                )}
                {data.caption ? <figcaption {...edit(tags, 'caption')}>{data.caption}</figcaption> : null}
              </figure>
            )
          }
          case 'quote':
            return (
              <blockquote className="block block--quote" key={i}>
                <p {...edit(tags, 'quote')}>{data.quote ?? ''}</p>
                {data.attribution ? <cite {...edit(tags, 'attribution')}>— {data.attribution}</cite> : null}
              </blockquote>
            )
          case 'callout': {
            const tone = data.tone || 'info'
            return (
              <aside className={`block block--callout callout--${tone}`} key={i}>
                {data.heading ? <strong {...edit(tags, 'heading')}>{data.heading}</strong> : null}
                {data.body ? <p {...edit(tags, 'body')}>{data.body}</p> : null}
              </aside>
            )
          }
          default:
            return null
        }
      })}
    </div>
  )
}
