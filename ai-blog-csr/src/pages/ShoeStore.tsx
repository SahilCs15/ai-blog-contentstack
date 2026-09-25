import { useCallback } from 'react'
import type { ImgHTMLAttributes, ReactNode } from 'react'
import { getShoeLanding } from '../lib/contentstack'
import { useEntry } from '../lib/useEntry'
import type {
  ShoeLanding, Shoe, ShoeSectionBlock, FeatureBannerBlock, SpecHighlightBlock,
  LookbookBlock, FaqBlock, CsAsset, ShoePromise, ShoeBrandPromise, NestedShowcaseBlock,
} from '../lib/types'
import { one } from '../lib/types'
import { edit, editField, editSibling } from '../lib/cslp'
import { VB_EmptyBlockParentClass } from '@contentstack/live-preview-utils'
import { imgLoading } from '../lib/img'
import { imageUrl, formatDate } from '../lib/format'
import { Rte } from '../lib/rte'
import { Loading, ErrorState, Empty } from '../components/States'

/* ---------- inline SVG icons (consistent 1.8 stroke / filled) ---------- */
type IProps = { className?: string }
const StarIcon = ({ className }: IProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.3l6.5-.9z" />
  </svg>
)
const ArrowIcon = ({ className }: IProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)
const BagIcon = ({ className }: IProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 7h12l-1 13H7L6 7zM9 7a3 3 0 0 1 6 0" />
  </svg>
)
const SearchIcon = ({ className }: IProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" />
  </svg>
)
const TruckIcon = ({ className }: IProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z" /><circle cx="7" cy="18" r="1.6" /><circle cx="17.5" cy="18" r="1.6" />
  </svg>
)
const ReturnIcon = ({ className }: IProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 12a9 9 0 1 0 3-6.7M3 4v4h4" />
  </svg>
)
const ShieldIcon = ({ className }: IProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /><path d="M9 12l2 2 4-4" />
  </svg>
)
const MedalIcon = ({ className }: IProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="14" r="6" /><path d="M9 8L7 2h10l-2 6M12 12v4M10 14h4" />
  </svg>
)
const HeartIcon = ({ className }: IProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 21C12 21 4 13.9 4 8.8 4 6.1 6.1 4 8.8 4 10.4 4 11.4 4.9 12 6c.6-1.1 1.6-2 3.2-2C17.9 4 20 6.1 20 8.8c0 5.1-8 12.2-8 12.2z" />
  </svg>
)
const CheckIcon = ({ className }: IProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6L9 17l-5-5" />
  </svg>
)
const PinIcon = ({ className }: IProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" /><circle cx="12" cy="10" r="2.6" />
  </svg>
)
const PROMISE_ICONS = [<TruckIcon />, <ReturnIcon />, <ShieldIcon />, <MedalIcon />]

type EditTag = { 'data-cslp'?: string; id?: string }

function Stars({ rating = 0, className }: { rating?: number; className?: string }) {
  const full = Math.max(0, Math.min(5, Math.round(rating)))
  return (
    <span className={className} role="img" aria-label={`${rating} out of 5 stars`} style={{ display: 'inline-flex', gap: 2 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ display: 'inline-flex', opacity: i < full ? 1 : 0.22 }}>
          <StarIcon />
        </span>
      ))}
    </span>
  )
}

// Fallback promises when the Brand Promise global field is empty.
const TRUST = [
  { t: 'Free shipping', s: 'On orders over $100' },
  { t: '30-day returns', s: 'No questions asked' },
  { t: 'Secure checkout', s: 'Encrypted payments' },
  { t: '2-year warranty', s: 'On every pair' },
]

const FOOTER_COLS = [
  { h: 'Shop', links: ['New arrivals', 'Best sellers', 'Running', 'Lifestyle', 'Sale'] },
  { h: 'Company', links: ['About us', 'Careers', 'Sustainability', 'Press'] },
  { h: 'Support', links: ['Help center', 'Shipping', 'Returns', 'Size guide', 'Contact'] },
]

function prettyTerm(uid?: string): string {
  if (!uid) return ''
  return uid.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

/* ---------- tiny markdown renderer for the Care Instructions field ---------- */
function mdInline(s: string): ReactNode[] {
  const parts = s.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean)
  return parts.map((p, i) => {
    if (/^\*\*[^*]+\*\*$/.test(p)) return <strong key={i}>{p.slice(2, -2)}</strong>
    if (/^\*[^*]+\*$/.test(p)) return <em key={i}>{p.slice(1, -1)}</em>
    return <span key={i}>{p}</span>
  })
}
function Markdown({ text }: { text?: string }) {
  if (!text) return null
  const out: ReactNode[] = []
  let list: ReactNode[] = []
  const flush = () => {
    if (list.length) { out.push(<ul key={`u${out.length}`}>{list}</ul>); list = [] }
  }
  // Reference-style image definitions ([1]: https://...) are collected and removed, so
  // they resolve into <img> instead of leaking the raw url as body text.
  const refs = new Map<string, string>()
  const lines: string[] = []
  text.split('\n').forEach((raw) => {
    const ref = raw.trim().match(/^\[([^\]]+)\]:\s*(\S+)/)
    if (ref) { refs.set(ref[1], ref[2]); return }
    // A heading glued onto the end of another line (![img][1]### Title) still has to
    // break, or the hashes render as text.
    raw.split(/(?<![#\s])(?=#{1,6}\s)/).forEach((piece) => lines.push(piece))
  })
  const image = (alt: string, src: string, key: string) =>
    src ? <img className="ss-md__img" key={key} src={src} alt={alt} loading={imgLoading()} /> : null
  lines.forEach((raw, i) => {
    const l = raw.trim()
    if (!l) return flush()
    const inlineImg = l.match(/^!\[([^\]]*)\]\(([^)\s]+)[^)]*\)$/)
    const refImg = l.match(/^!\[([^\]]*)\]\[([^\]]+)\]$/)
    if (inlineImg) { flush(); out.push(image(inlineImg[1], inlineImg[2], `i${i}`)) }
    else if (refImg) { flush(); out.push(image(refImg[1], refs.get(refImg[2]) || '', `i${i}`)) }
    else if (/^#{3,6}\s/.test(l)) { flush(); out.push(<h4 key={i}>{mdInline(l.replace(/^#+\s*/, ''))}</h4>) }
    else if (/^#{1,2}\s/.test(l)) { flush(); out.push(<h3 key={i}>{mdInline(l.replace(/^#+\s*/, ''))}</h3>) }
    else if (l.startsWith('> ')) { flush(); out.push(<blockquote key={i}>{mdInline(l.slice(2))}</blockquote>) }
    else if (l.startsWith('- ')) { list.push(<li key={i}>{mdInline(l.slice(2))}</li>) }
    else { flush(); out.push(<p key={i}>{mdInline(l)}</p>) }
  })
  flush()
  return <div className="ss-md">{out}</div>
}

function ShoeCard({ shoe, instanceTag }: { shoe: Shoe; instanceTag?: EditTag }) {
  const accent = shoe.accent_color || '#ff4a2b'
  return (
    <article className="ss-card" style={{ ['--card-accent' as string]: accent }} {...(instanceTag ?? {})}>
      <div className="ss-card__media">
        {shoe.badge ? <span className="ss-card__badge" {...edit(shoe.$, 'badge')}>{shoe.badge}</span> : null}
        <button type="button" className="ss-card__wish" aria-label={`Save ${shoe.title}`}><HeartIcon /></button>
        {shoe.image?.url ? (
          <img src={imageUrl(shoe.image.url, 640)} alt={shoe.title} loading={imgLoading()} {...edit(shoe.image.$, 'url')} />
        ) : (
          <div className="ss-card__placeholder" aria-hidden="true" />
        )}
        {typeof shoe.rating === 'number' ? (
          <span className="ss-card__ratepill" {...edit(shoe.$, 'rating')}><StarIcon /> <span className="ss-num">{shoe.rating.toFixed(1)}</span></span>
        ) : null}
      </div>
      <div className="ss-card__body">
        <h3 className="ss-card__name" {...edit(shoe.$, 'title')}>{shoe.title}</h3>
        <div className="ss-card__swatches" aria-hidden="true">
          <span style={{ ['--sw' as string]: accent }} />
          <span style={{ ['--sw' as string]: '#20232b' }} />
          <span style={{ ['--sw' as string]: '#e9e9ee' }} />
        </div>
        <div className="ss-card__foot">
          <div className="ss-card__pricewrap">
            <span className="ss-card__plabel">Price</span>
            <span className="ss-card__price ss-num" {...edit(shoe.$, 'price')}>
              ${typeof shoe.price === 'number' ? shoe.price.toFixed(2) : shoe.price}
            </span>
          </div>
          <button type="button" className="ss-card__add"><BagIcon /> Add to bag</button>
        </div>
      </div>
    </article>
  )
}

/**
 * Plain <img> wrapper so the shared sections below read the same in the CSR and
 * SSR apps.
 */
// An empty instance still has to paint a box, or Visual Builder has nothing to
// select and an added instance looks like nothing happened.
function slot(value?: string | null) {
  return value && value.trim() ? value : <span className="ss-slot-empty">Empty</span>
}


function Img(props: ImgHTMLAttributes<HTMLImageElement>) {
  return <img {...props} alt={props.alt ?? ''} />
}

/**
 * Promise grid shared by the Brand Promise global field, the repeatable Promise
 * Sections global field, and the promise nested inside the Nested Showcase block.
 */
function PromiseGrid({ bp, tag, className }: { bp?: ShoeBrandPromise; tag?: EditTag; className?: string }) {
  const promises: ShoePromise[] = bp?.promises
    ? bp.promises
    : TRUST.map((t) => ({ heading: t.t, description: t.s }))
  return (
    <section className={`ss-promise${className ? ` ${className}` : ''}`} {...tag}>
      {(bp?.section_heading || bp?.section_subtext) && (
        <div className="ss-section-head">
          {bp?.section_heading ? <h2 {...edit(bp.$, 'section_heading')}>{bp.section_heading}</h2> : null}
          {bp?.section_subtext ? <p {...edit(bp.$, 'section_subtext')}>{bp.section_subtext}</p> : null}
        </div>
      )}
      <div className="ss-promise__grid" {...edit(bp?.$, 'promises')}>
        {promises.map((p, i) => (
          <div className="ss-promise__item" key={i} {...edit(bp?.$, `promises__${i}`)}>
            <span className="ss-promise__ic">
              {p.icon?.url ? <Img src={imageUrl(p.icon.url, 96)} {...edit(p.icon.$, 'url')} /> : PROMISE_ICONS[i % PROMISE_ICONS.length]}
            </span>
            <span className="ss-promise__t" {...edit(p.$, 'heading')}>{slot(p.heading)}</span>
            <span className="ss-promise__s" {...edit(p.$, 'description')}>{slot(p.description)}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ---------- Brand Promise (single global field) ---------- */
function BrandPromise({ page }: { page: ShoeLanding }) {
  return <PromiseGrid bp={page.brand_promise} tag={{ id: 'promise', ...edit(page.$, 'brand_promise') } as EditTag} />
}

/* ---------- Modular block renderers ----------
 * `sectionTag` is the block-instance CSLP tag (edit(page.$, `sections__<index>`))
 * so the whole block instance gets a Visual Builder border; nested fields carry
 * their own block-level tags via the block object's `$`.
 */
function FeatureBanner({ b, sectionTag }: { b: FeatureBannerBlock; sectionTag?: EditTag }) {
  const right = b.align === 'right'
  return (
    <section className={`ss-feature${right ? ' ss-feature--right' : ''}`} {...sectionTag}>
      <div className="ss-feature__media">
        {b.image?.url ? <img src={imageUrl(b.image.url, 900)} alt={b.heading || ''} loading={imgLoading()} {...edit(b.image.$, 'url')} /> : null}
      </div>
      <div className="ss-feature__text">
        <h2 {...edit(b.$, 'heading')}>{b.heading}</h2>
        <p {...edit(b.$, 'subtext')}>{b.subtext}</p>
        {b.cta?.href ? <a className="ss-btn" href={b.cta.href} {...edit(b.$, 'cta')}>{slot(b.cta.title)}</a> : null}
      </div>
    </section>
  )
}

function SpecStrip({ specs }: { specs: Array<{ data: SpecHighlightBlock; sectionTag: EditTag }> }) {
  if (!specs.length) return null
  return (
    <section className="ss-specs">
      {specs.map(({ data: s, sectionTag }, i) => (
        <div className="ss-spec" key={i} {...sectionTag}>
          <span className="ss-spec__val ss-num" {...edit(s.$, 'value')}>{s.value}<small {...edit(s.$, 'unit')}>{s.unit}</small></span>
          <span className="ss-spec__label" {...edit(s.$, 'label')}>{s.label}</span>
        </div>
      ))}
    </section>
  )
}

function LookbookGrid({ b, sectionTag }: { b: LookbookBlock; sectionTag?: EditTag }) {
  const imgs = b.images ?? []
  return (
    <section className="ss-lookbook" id="lookbook" {...sectionTag}>
      <div className="ss-section-head">
        <span className="ss-eyebrow">Lookbook</span>
        <h2 {...edit(b.$, 'caption')}>{slot(b.caption)}</h2>
      </div>
      <div
        className={imgs.length ? 'ss-lookbook__grid' : `ss-lookbook__grid ${VB_EmptyBlockParentClass}`}
        {...editSibling(b.$, 'images')}
      >
        {imgs.map((im, i) => (
          <figure className="ss-lookbook__cell" key={i} {...edit(b.$, `images__${i}`)}>
            {im?.url ? <img src={imageUrl(im.url, 700)} alt={b.caption || ''} loading={imgLoading()} {...edit(im.$, 'url')} /> : null}
          </figure>
        ))}
      </div>
    </section>
  )
}

function FaqList({ faqs }: { faqs: Array<{ data: FaqBlock; sectionTag: EditTag }> }) {
  if (!faqs.length) return null
  return (
    <section className="ss-faq" id="faq">
      <div className="ss-section-head">
        <span className="ss-eyebrow">Good to know</span>
        <h2>Frequently asked</h2>
      </div>
      <div className="ss-faq__list">
        {faqs.map(({ data: f, sectionTag }, i) => (
          <details className="ss-faq__item" key={i} open={i === 0} {...sectionTag}>
            <summary {...edit(f.$, 'question')}>{f.question}</summary>
            <p {...edit(f.$, 'answer')}>{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

/* ---------- Promo blocks (modular blocks, empty by default) ---------- */
function PromoBlocks({ page }: { page: ShoeLanding }) {
  const blocks = page.promo_blocks ?? []
  return (
    <section className="ss-promo" id="promo">
      <div className="ss-section-head">
        <span className="ss-eyebrow">Promo</span>
        <h2>Promo blocks</h2>
      </div>
      {/* VB_EmptyBlockParentClass makes the canvas hydrate its own placeholder and
          add button into this element while the field has no blocks. */}
      <div
        className={blocks.length ? 'ss-promo__list' : `ss-promo__list ${VB_EmptyBlockParentClass}`}
        {...editField(page, 'promo_blocks')}
      >
        {blocks.map((b, i) => (
          <div className="ss-promo__item" key={b._metadata?.uid || i} {...edit(page.$, `promo_blocks__${i}`)}>
            {b.promo_note ? (
              <>
                <h3 {...edit(b.promo_note.$, 'heading')}>{slot(b.promo_note.heading)}</h3>
                <p {...edit(b.promo_note.$, 'body')}>{slot(b.promo_note.body)}</p>
              </>
            ) : null}
            {b.promo_stat ? (
              <>
                <span className="ss-promo__label" {...edit(b.promo_stat.$, 'label')}>{slot(b.promo_stat.label)}</span>
                <b className="ss-num" {...edit(b.promo_stat.$, 'value')}>
                  {typeof b.promo_stat.value === 'number' ? b.promo_stat.value : slot(undefined)}
                </b>
              </>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  )
}

/* ---------- Spotlight pick (single reference) ---------- */
function Spotlight({ page }: { page: ShoeLanding }) {
  const shoe = one(page.spotlight_shoe)
  if (!shoe?.title) return null
  return (
    <section className="ss-spotlight" id="spotlight" {...editField(page, 'spotlight_shoe')}>
      <div className="ss-section-head">
        <span className="ss-eyebrow">Editor&rsquo;s pick</span>
        <h2>One pair we keep coming back to</h2>
      </div>
      <div className="ss-spotlight__inner">
        <ShoeCard shoe={shoe} />
        <div className="ss-spotlight__note">
          {shoe.short_description ? <p {...edit(shoe.$, 'short_description')}>{shoe.short_description}</p> : null}
          {typeof shoe.rating === 'number' ? <Stars rating={shoe.rating} /> : null}
        </div>
      </div>
    </section>
  )
}

/* ---------- Price tiers (multiple number + multiple boolean) ---------- */
function PriceTiers({ page }: { page: ShoeLanding }) {
  const tiers = page.price_tiers ?? []
  const flags = page.in_stock_flags ?? []
  if (!tiers.length) return null
  return (
    <section className="ss-tiers" id="tiers">
      <div className="ss-section-head">
        <span className="ss-eyebrow">Pricing</span>
        <h2>Pick your tier</h2>
      </div>
      <div className="ss-tiers__row" {...editField(page, 'price_tiers')}>
        {tiers.map((t, i) => {
          const inStock = flags[i]
          return (
            <div className={`ss-tier${inStock === false ? ' ss-tier--out' : ''}`} key={i} {...edit(page.$, `price_tiers__${i}`)}>
              <span className="ss-tier__price ss-num">${t}</span>
              <span className="ss-tier__stock" {...edit(page.$, `in_stock_flags__${i}`)}>
                {inStock === false ? 'Out of stock' : 'In stock'}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

/* ---------- Restock dates (multiple date) + retailers (multiple link) ---------- */
function RestockAndRetailers({ page }: { page: ShoeLanding }) {
  const dates = page.restock_dates ?? []
  const links = page.retailer_links ?? []
  if (!dates.length && !links.length) return null
  return (
    <section className="ss-restock" id="restock">
      <div className="ss-restock__cols">
        {(
          <div>
            <span className="ss-guide__label">Restock dates</span>
            <ul className="ss-datelist" {...editField(page, 'restock_dates')}>
              {dates.map((d, i) => (
                <li key={i} {...edit(page.$, `restock_dates__${i}`)}><StarIcon /> {formatDate(d)}</li>
              ))}
            </ul>
          </div>
        )}
        {(
          <div>
            <span className="ss-guide__label">Where to buy</span>
            <div className="ss-linkrow" {...editField(page, 'retailer_links')}>
              {links.map((l, i) => (l?.href ? (
                <a className="ss-btn ss-btn--ghost" key={i} href={l.href} target="_blank" rel="noreferrer" {...edit(page.$, `retailer_links__${i}`)}>
                  {l.title || l.href} <ArrowIcon />
                </a>
              ) : null))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

/* ---------- Shipping notes (multiple multiline) + materials (multiple markdown) ---------- */
function NotesAndMaterials({ page }: { page: ShoeLanding }) {
  const materials = page.material_notes ?? []
  if (!materials.length) return null
  return (
    <section className="ss-notes" id="notes">
      <div className="ss-section-head">
        <span className="ss-eyebrow">The detail</span>
        <h2>Delivery, returns and materials</h2>
      </div>
      <div className="ss-notes__grid" {...editField(page, 'material_notes')}>
        {materials.map((m, i) => (
          <div className="ss-note ss-note--md" key={`m${i}`} {...edit(page.$, `material_notes__${i}`)}>
            {m && m.trim() ? <Markdown text={m} /> : slot('')}
          </div>
        ))}
      </div>
    </section>
  )
}

/* ---------- Campaign copy (multiple RTE) + press notes (multiple JSON RTE) ---------- */
function CampaignAndPress({ page }: { page: ShoeLanding }) {
  const press = page.press_notes ?? []
  if (!press.length) return null
  return (
    <section className="ss-press" id="press">
      <div className="ss-section-head">
        <span className="ss-eyebrow">Newsroom</span>
        <h2>Campaign &amp; press</h2>
      </div>
      <div className="ss-press__grid" {...editField(page, 'press_notes')}>
        {press.map((doc, i) => (
          <article className="ss-press__card prose" key={`p${i}`} {...edit(page.$, `press_notes__${i}`)}>
            <Rte doc={doc} />
          </article>
        ))}
      </div>
    </section>
  )
}

/* ---------- Promise Sections (multiple global field) ---------- */
function PromiseSections({ page }: { page: ShoeLanding }) {
  const sections = page.promise_sections ?? []
  if (!sections.length) return null
  return (
    <div>
      {sections.map((bp, i) => (
        <PromiseGrid key={i} bp={bp} tag={edit(page.$, `promise_sections__${i}`)} className="ss-promise--alt" />
      ))}
    </div>
  )
}

/* ---------- Counter extras: single reference + global field inside a group ---------- */
function CounterExtras({ page }: { page: ShoeLanding }) {
  const info = page.store_info
  const pick = one(info?.staff_pick)
  if (!info || (!pick?.title && !info.counter_promise)) return null
  return (
    <section className="ss-counter" id="counter">
      {pick?.title ? (
        <div className="ss-counter__pick" {...edit(info.$, 'staff_pick')}>
          <span className="ss-guide__label">Staff pick at the counter</span>
          <ShoeCard shoe={pick} />
        </div>
      ) : null}
      {info.counter_promise ? (
        <PromiseGrid bp={info.counter_promise} tag={edit(info.$, 'counter_promise')} className="ss-promise--alt" />
      ) : null}
    </section>
  )
}

/* ---------- Nested Showcase block: modular blocks inside a modular block ---------- */
function NestedShowcase({ b, sectionTag }: { b: NestedShowcaseBlock; sectionTag?: EditTag }) {
  const linked = one(b.linked_shoe)
  const reads = b.linked_reads ?? []
  const stills = b.stills ?? []
  return (
    <section className={`ss-showcase ss-showcase--${b.theme || 'light'}`} id="showcase" {...sectionTag}>
      <div className="ss-section-head">
        <span className="ss-eyebrow" {...edit(b.$, 'theme')}>{b.theme} theme</span>
        <h2 {...edit(b.$, 'heading')}>{b.heading}</h2>
      </div>

      {b.detail ? (
        <div className="ss-showcase__detail" {...edit(b.$, 'detail')}>
          <span className="ss-guide__label" {...edit(b.detail.$, 'label')}>{b.detail.label}</span>
          {typeof b.detail.weight_grams === 'number' ? (
            <b className="ss-num" {...edit(b.detail.$, 'weight_grams')}>{b.detail.weight_grams}g</b>
          ) : null}
          {b.detail.inner?.note ? (
            <p className="ss-showcase__note" {...edit(b.detail.inner.$, 'note')}>{b.detail.inner.note}</p>
          ) : null}
        </div>
      ) : null}

      {b.panels?.length ? (
        <div className="ss-showcase__panels" {...edit(b.$, 'panels')}>
          {b.panels.map((p, i) => (
            <div className="ss-panel" key={p._metadata?.uid || i} {...edit(b.$, `panels__${i}`)}>
              {p.copy_panel ? (
                <>
                  <h3 {...edit(p.copy_panel.$, 'panel_heading')}>{p.copy_panel.panel_heading}</h3>
                  <p {...edit(p.copy_panel.$, 'panel_body')}>{p.copy_panel.panel_body}</p>
                </>
              ) : null}
              {p.media_panel ? (
                <>
                  {p.media_panel.panel_image?.url ? (
                    <Img
                      src={imageUrl(p.media_panel.panel_image.url, 700)}
                      alt={p.media_panel.panel_cta?.title || ''}
                      loading={imgLoading()}
                      {...edit(p.media_panel.panel_image.$, 'url')}
                    />
                  ) : null}
                  {p.media_panel.panel_cta?.href ? (
                    <a className="ss-btn ss-btn--ghost" href={p.media_panel.panel_cta.href} {...edit(p.media_panel.$, 'panel_cta')}>
                      {slot(p.media_panel.panel_cta.title)}
                    </a>
                  ) : null}
                </>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      <div
        className={stills.length ? 'ss-showcase__stills' : `ss-showcase__stills ${VB_EmptyBlockParentClass}`}
        {...editSibling(b.$, 'stills')}
      >
        {stills.map((s, i) => (
          <figure key={s?.uid || i} {...edit(b.$, `stills__${i}`)}>
            {s?.url ? <Img src={imageUrl(s.url, 520)} alt={s.title || ''} loading={imgLoading()} /> : null}
          </figure>
        ))}
      </div>

      {b.promise ? <PromiseGrid bp={b.promise} tag={edit(b.$, 'promise')} className="ss-promise--alt" /> : null}

      <div className="ss-showcase__links">
        {linked?.title ? (
          <div {...edit(b.$, 'linked_shoe')}>
            <span className="ss-guide__label">Featured pair</span>
            <ShoeCard shoe={linked} />
          </div>
        ) : null}
        <div {...editSibling(b.$, 'linked_reads')}>
          <span className="ss-guide__label">Read next</span>
          <ul className="ss-readlist">
            {reads.map((r, i) => (
              <li key={r?.uid || i} {...edit(b.$, `linked_reads__${i}`)}>
                {slot(r?.title)} <small>{r?._content_type_uid}</small>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* ---------- Gallery (multiple assets) ---------- */
function Gallery({ assets, containerTag, instanceTag }: { assets?: CsAsset[]; containerTag?: EditTag; instanceTag?: (i: number) => EditTag }) {
  const imgs = (assets ?? []).filter((a) => a?.url)
  if (!imgs.length) return null
  return (
    <section className="ss-gallery" id="gallery">
      <div className="ss-section-head">
        <span className="ss-eyebrow">The collection</span>
        <h2>Every angle</h2>
      </div>
      <div className="ss-gallery__grid" {...containerTag}>
        {imgs.map((a, i) => (
          <figure className="ss-gallery__cell" key={a.uid || i} {...(instanceTag?.(i) ?? edit(a.$, 'url'))}>
            <img src={imageUrl(a.url, 600)} alt={a.title || a.filename || ''} loading={imgLoading()} />
          </figure>
        ))}
      </div>
    </section>
  )
}

/* ---------- Size & Care (JSON RTE + markdown + link + sizes) ---------- */
function SizeCare({ page }: { page: ShoeLanding }) {
  const hasGuide = page.size_care_guide || page.care_instructions || page.available_sizes?.length
  if (!hasGuide) return null
  return (
    <section className="ss-guide" id="guide">
      <div className="ss-section-head">
        <span className="ss-eyebrow">Fit & care</span>
        <h2>Size & Care guide</h2>
      </div>
      <div className="ss-guide__cols">
        <div className="ss-guide__rte prose" {...edit(page.$, 'size_care_guide')}>
          <Rte doc={page.size_care_guide} embeds={page._guide_embeds} />
        </div>
        <aside className="ss-guide__side">
          {page.available_sizes ? (
            <div className="ss-guide__sizes">
              <span className="ss-guide__label">Available sizes</span>
              <div className="ss-chiprow" {...editField(page, 'available_sizes')}>
                {page.available_sizes.map((s, i) => <span className="ss-size" key={i} {...edit(page.$, `available_sizes__${i}`)}>{slot(s)}</span>)}
              </div>
            </div>
          ) : null}
          {page.care_instructions ? (
            <div className="ss-guide__care" {...edit(page.$, 'care_instructions')}>
              <Markdown text={page.care_instructions} />
            </div>
          ) : null}
          {page.size_guide_link?.href ? (
            <a className="ss-btn ss-btn--ghost" href={page.size_guide_link.href} target="_blank" rel="noreferrer" {...edit(page.$, 'size_guide_link')}>
              {slot(page.size_guide_link.title)} <ArrowIcon />
            </a>
          ) : null}
        </aside>
      </div>
    </section>
  )
}

/* ---------- You may also like (reference) ---------- */
function RelatedProducts({ shoes, containerTag, instanceTag }: { shoes?: Shoe[]; containerTag?: EditTag; instanceTag?: (i: number) => EditTag }) {
  const items = (shoes ?? []).filter((s) => s && s.title)
  if (!items.length) return null
  return (
    <section className="ss-related" id="related">
      <div className="ss-section-head">
        <span className="ss-eyebrow">Complete the look</span>
        <h2>You may also like</h2>
      </div>
      <div className="ss-grid" {...containerTag}>
        {items.map((s, i) => <ShoeCard key={s.uid} shoe={s} instanceTag={instanceTag?.(i)} />)}
      </div>
    </section>
  )
}

export default function ShoeStore() {
  const loader = useCallback((locale: string): Promise<ShoeLanding | null> => getShoeLanding(locale), [])
  const { data: page, loading, error } = useEntry<ShoeLanding | null>(loader)

  if (loading && !page) return <Loading label="Loading the shoe store…" />
  if (error) return <ErrorState error={error} />
  if (!page) return <Empty title="Shoe store not found" hint="Publish a shoe_landing entry to this environment." />

  const brand = page.brand_name
  const navLinks = page.nav_links ?? []

  // Split the modular blocks into their kinds. Keep each block's ORIGINAL index
  // so the block-instance CSLP tag (edit(page.$, `sections__<index>`)) lands on
  // the right instance even though we aggregate specs/faqs into their own strips.
  const blocks: ShoeSectionBlock[] = page.sections ?? []
  const sectionTag = (i: number): EditTag => edit(page.$, `sections__${i}`)
  const specItems = blocks
    .map((b, i) => (b.spec_highlight ? { data: b.spec_highlight, sectionTag: sectionTag(i) } : null))
    .filter((x): x is { data: SpecHighlightBlock; sectionTag: EditTag } => !!x)
  const faqItems = blocks
    .map((b, i) => (b.faq ? { data: b.faq, sectionTag: sectionTag(i) } : null))
    .filter((x): x is { data: FaqBlock; sectionTag: EditTag } => !!x)

  return (
    <div className="shoestore">
      {(page.free_shipping || page.drop_date) && (
        <div className="ss-ticker">
          {page.free_shipping ? <span {...edit(page.$, 'free_shipping')}><TruckIcon /> Free express shipping on every order</span> : null}
          {page.drop_date ? <span {...edit(page.$, 'drop_date')}><StarIcon /> Next drop {formatDate(page.drop_date)}</span> : null}
          {page.collection ? <span {...edit(page.$, 'collection')}><CheckIcon /> {page.collection} collection now live</span> : null}
        </div>
      )}

      <header className="ss-nav">
        <div className="ss-nav__inner">
          <a className="ss-nav__brand" href="#top">
            <span className="ss-nav__mark"><BagIcon /></span>
            <span {...edit(page.$, 'brand_name')}>{slot(brand)}</span>
          </a>
          <nav className="ss-nav__links" {...(page.nav_links ? editField(page, 'nav_links') : {})}>
            {navLinks.map((n, i) => (
              // The instance tag goes on the wrapper so Visual Builder selects THIS
              // nav link; the inner tag keeps the label itself editable.
              <span key={i} {...(page.nav_links ? edit(page.$, `nav_links__${i}`) : {})}>
                <a href={n.link || '#'} {...edit(n.$, 'label')}>{slot(n.label)}</a>
              </span>
            ))}
          </nav>
          <div className="ss-nav__right">
            <button type="button" className="ss-icon-btn" aria-label="Search"><SearchIcon /></button>
            <button type="button" className="ss-icon-btn" aria-label="Cart"><BagIcon /></button>
            <a className="ss-nav__cta" href="#newsletter">Get in touch</a>
          </div>
        </div>
      </header>

      <section className="ss-hero" id="about">
        <div className="ss-hero__text">
          <span className="ss-kicker">
            <b {...edit(page.$, 'collection')}>{slot(page.collection)}</b> {page.drop_date ? `drop lands ${formatDate(page.drop_date)}` : null}
          </span>
          <h1 className="ss-hero__heading" {...edit(page.$, 'hero_heading')}>
            {(() => {
              const t = page.hero_heading ?? ''
              const hl = page.hero_highlight
              if (!hl || !t.includes(hl)) return t
              const [b, a] = t.split(hl)
              return (<>{b}<span className="ss-accent" {...edit(page.$, 'hero_highlight')}>{hl}</span>{a}</>)
            })()}
          </h1>
          <p className="ss-hero__sub" {...edit(page.$, 'hero_subtext')}>{page.hero_subtext}</p>
          {page.usp_chips ? (
            <ul className="ss-usps" {...editField(page, 'usp_chips')}>
              {page.usp_chips.map((u, i) => <li key={i} {...edit(page.$, `usp_chips__${i}`)}><CheckIcon /> {slot(u)}</li>)}
            </ul>
          ) : null}
          <div className="ss-hero__actions">
            <a className="ss-btn" href="#products"><span {...edit(page.$, 'hero_cta_label')}>{slot(page.hero_cta_label)}</span></a>
            <a className="ss-btn ss-btn--ghost" href="#products">Explore collection</a>
          </div>
          <div className="ss-hero__stat">
            <div className="ss-hero__ratewrap">
              <span className="ss-hero__stars"><Stars rating={5} /></span>
              <span className="ss-hero__substat"><b className="ss-num">4.9</b> average rating</span>
            </div>
            <span className="ss-hero__divider" />
            {(page.stat_value || page.stat_label) && (
              <div className="ss-hero__ratewrap">
                <b className="ss-num" {...edit(page.$, 'stat_value')}>{page.stat_value}</b>
                <span className="ss-hero__substat" {...edit(page.$, 'stat_label')}>{page.stat_label}</span>
              </div>
            )}
            {typeof page.products_in_stock === 'number' && (
              <>
                <span className="ss-hero__divider" />
                <div className="ss-hero__ratewrap">
                  <b className="ss-num" {...edit(page.$, 'products_in_stock')}>{page.products_in_stock}</b>
                  <span className="ss-hero__substat">styles in stock</span>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="ss-hero__media">
          {page.promo_label ? <span className="ss-hero__promo" {...edit(page.$, 'promo_label')}>{page.promo_label}</span> : null}
          {page.hero_image?.url ? (
            <img src={imageUrl(page.hero_image.url, 1000)} alt={page.hero_heading ?? ''} {...edit(page.hero_image.$, 'url')} />
          ) : <div className="ss-hero__placeholder" aria-hidden="true" />}
        </div>
      </section>

      <BrandPromise page={page} />

      <Spotlight page={page} />

      <PriceTiers page={page} />

      <section className="ss-products" id="products">
        <div className="ss-section-head">
          <div>
            <span className="ss-eyebrow">Bestsellers</span>
            <h2>Popular Products</h2>
          </div>
          <p>Handpicked drops loved by our community.</p>
        </div>
        {page.available_sizes ? (
          // A size filter, not a second render of the field. Deliberately untagged:
          // two DOM nodes claiming the same instance path make the edit target
          // ambiguous, so the size guide below stays the one editable source.
          <div className="ss-chiprow ss-chiprow--center">
            <span className="ss-guide__label">Filter by size:</span>
            {page.available_sizes.map((s, i) => <span className="ss-size" key={i}>{slot(s)}</span>)}
          </div>
        ) : null}
        <div className="ss-grid" {...editField(page, 'featured_shoes')}>
          {(page.featured_shoes ?? []).map((s, i) => (
            <ShoeCard key={s.uid} shoe={s} instanceTag={edit(page.$, `featured_shoes__${i}`)} />
          ))}
        </div>
        {(page.collection_code || page.region_codes) ? (
          <p className="ss-collcode">
            {page.collection_code ? <span {...edit(page.$, 'collection_code')}>Collection code <b>{page.collection_code}</b></span> : null}
            {page.region_codes ? <span {...edit(page.$, 'region_codes')}>Region <b>{page.region_codes}</b></span> : null}
          </p>
        ) : null}
      </section>

      {page.brand_story ? (
        <section className="ss-story" id="story">
          <div className="ss-story__inner prose" {...edit(page.$, 'brand_story')} dangerouslySetInnerHTML={{ __html: page.brand_story }} />
        </section>
      ) : null}

      {/* Every block instance must be a DOM descendant of the element tagged with the
          bare `sections` path, or the canvas cannot resolve the parent field. */}
      <div {...editField(page, 'sections')} data-add-direction="vertical">
        <SpecStrip specs={specItems} />
        {blocks.map((b, i) => {
          if (b.feature_banner) return <FeatureBanner b={b.feature_banner} sectionTag={sectionTag(i)} key={b._metadata?.uid || i} />
          if (b.lookbook) return <LookbookGrid b={b.lookbook} sectionTag={sectionTag(i)} key={b._metadata?.uid || i} />
          if (b.nested_showcase) return <NestedShowcase b={b.nested_showcase} sectionTag={sectionTag(i)} key={b._metadata?.uid || i} />
          return null // spec_highlight + faq aggregated into their own strips
        })}
        <FaqList faqs={faqItems} />
      </div>

      <PromoBlocks page={page} />

      <Gallery
        assets={page.gallery}
        containerTag={editField(page, 'gallery')}
        instanceTag={(i) => edit(page.$, `gallery__${i}`)}
      />

      <SizeCare page={page} />

      <RelatedProducts
        shoes={page.related_products}
        containerTag={editField(page, 'related_products')}
        instanceTag={(i) => edit(page.$, `related_products__${i}`)}
      />

      <RestockAndRetailers page={page} />

      <NotesAndMaterials page={page} />

      <CampaignAndPress page={page} />

      <PromiseSections page={page} />

      <CounterExtras page={page} />

      {page.testimonials?.length ? (
        <section className="ss-testimonials" id="testimonials">
          <div className="ss-section-head">
            <div>
              <span className="ss-eyebrow">Reviews</span>
              <h2>What Our Customers Say</h2>
            </div>
          </div>
          <div className="ss-tgrid" {...editField(page, 'testimonials')}>
            {page.testimonials.map((t, i) => (
              <figure className="ss-quote" key={i} {...edit(page.$, `testimonials__${i}`)}>
                <div className="ss-quote__mark" aria-hidden="true">&ldquo;</div>
                <span className="ss-quote__stars"><Stars rating={5} /></span>
                <blockquote {...edit(t.$, 'quote')}>{t.quote}</blockquote>
                <figcaption className="ss-quote__by">
                  {t.avatar?.url ? <img src={imageUrl(t.avatar.url, 96)} alt={t.customer_name} {...edit(t.avatar.$, 'url')} /> : <span className="ss-quote__avatar" aria-hidden="true" />}
                  <span><b {...edit(t.$, 'customer_name')}>{t.customer_name}</b><small {...edit(t.$, 'customer_role')}>{t.customer_role}</small></span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      {page.taxonomies?.length ? (
        <section className="ss-tags">
          <span className="ss-tags__label">Tagged</span>
          <div className="ss-chiprow ss-chiprow--center" {...editField(page, 'taxonomies')}>
            {page.taxonomies.map((t, i) => <span className="ss-tag" key={i}>#{prettyTerm(t.term_uid)}</span>)}
          </div>
        </section>
      ) : null}

      <section className="ss-newsletter" id="newsletter">
        <h2 {...edit(page.$, 'newsletter_heading')}>{slot(page.newsletter_heading)}</h2>
        <p {...edit(page.$, 'newsletter_subtext')}>{page.newsletter_subtext}</p>
        <form className="ss-news-form" onSubmit={(e) => e.preventDefault()}>
          <input type="email" placeholder="Enter your email" aria-label="Email address" />
          <button type="submit">Subscribe</button>
        </form>
      </section>

      <footer className="ss-footer">
        <div className="ss-footer__top">
          <div>
            <span className="ss-footer__brand" {...edit(page.$, 'brand_name')}>{slot(brand)}</span>
            <p className="ss-footer__blurb">Premium sneakers engineered for comfort and built to last. Step into performance and style.</p>
            <div className="ss-social">
              <a href="#" aria-label="Twitter"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 2H22l-7.6 8.7L23 22h-6.8l-5.3-6.9L4.8 22H2l8.2-9.3L1.5 2h6.9l4.8 6.4zM17.7 20h1.7L7.4 3.9H5.6z" /></svg></a>
              <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg></a>
              <a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H7v3h3v6h3v-6h3l1-3h-4v-2c0-.6.4-1 1-1z" /></svg></a>
            </div>
          </div>
          {FOOTER_COLS.map((c) => (
            <div className="ss-fcol" key={c.h}>
              <h4>{c.h}</h4>
              {c.links.map((l) => <a href="#" key={l}>{l}</a>)}
            </div>
          ))}
          {page.store_info ? (
            <div className="ss-fcol ss-store" {...edit(page.$, 'store_info')}>
              <h4>Visit us</h4>
              {page.store_info.address ? <p className="ss-store__line"><PinIcon /> <span {...edit(page.store_info.$, 'address')}>{page.store_info.address}</span></p> : null}
              {page.store_info.opening_hours ? <p className="ss-store__line" {...edit(page.store_info.$, 'opening_hours')}>{page.store_info.opening_hours}</p> : null}
              {page.store_info.phone ? <a href={`tel:${page.store_info.phone}`} {...edit(page.store_info.$, 'phone')}>{page.store_info.phone}</a> : null}
              {page.store_info.email ? <a href={`mailto:${page.store_info.email}`} {...edit(page.store_info.$, 'email')}>{page.store_info.email}</a> : null}
              {page.store_info.map_link?.href ? <a href={page.store_info.map_link.href} target="_blank" rel="noreferrer" {...edit(page.store_info.$, 'map_link')}>{slot(page.store_info.map_link.title)}</a> : null}
              {typeof page.store_info.years_in_business === 'number' ? <span className="ss-store__badge" {...edit(page.store_info.$, 'years_in_business')}>{page.store_info.years_in_business} years on the high street</span> : null}
              {page.store_info.geo ? (
                <div className="ss-store__geo" {...edit(page.store_info.$, 'geo')}>
                  {page.store_info.geo.latitude && page.store_info.geo.longitude ? (
                    <span className="ss-store__coords">
                      <span {...edit(page.store_info.geo.$, 'latitude')}>{page.store_info.geo.latitude}</span>,{' '}
                      <span {...edit(page.store_info.geo.$, 'longitude')}>{page.store_info.geo.longitude}</span>
                    </span>
                  ) : null}
                  <span {...edit(page.store_info.geo.$, 'has_parking')}>
                    {page.store_info.geo.has_parking ? 'On-site parking' : 'No on-site parking'}
                  </span>
                  {page.store_info.geo.nearest_transit?.station ? (
                    <span {...edit(page.store_info.geo.$, 'nearest_transit')}>
                      <span {...edit(page.store_info.geo.nearest_transit.$, 'station')}>{page.store_info.geo.nearest_transit.station}</span>
                      {typeof page.store_info.geo.nearest_transit.walk_minutes === 'number' ? (
                        <>
                          {' · '}
                          <span {...edit(page.store_info.geo.nearest_transit.$, 'walk_minutes')}>
                            {page.store_info.geo.nearest_transit.walk_minutes} min walk
                          </span>
                        </>
                      ) : null}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="ss-footer__bar">
          <p {...edit(page.$, 'footer_note')}>{slot(page.footer_note)}</p>
          <div className="ss-footer__legal">
            <a href="#">Privacy</a><a href="#">Terms</a><a href="#">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
