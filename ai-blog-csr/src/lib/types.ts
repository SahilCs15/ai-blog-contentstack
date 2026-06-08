// Shape of the seeded content. Only the fields the UI reads are typed; the
// `$` key carries Contentstack live-preview edit tags (CSLP) when present.

export interface CslpTag {
  'data-cslp'?: string
}
export type Cslp = Record<string, CslpTag | undefined>

export interface CsAsset {
  uid: string
  url: string
  title?: string
  filename?: string
  $?: Cslp
}

export interface PublishDetails {
  environment?: string
  locale?: string
  time?: string
}

export interface Author {
  uid: string
  title: string
  url?: string
  bio?: string
  role?: string
  avatar?: CsAsset | null
  $?: Cslp
}

export interface Category {
  uid: string
  title: string
  slug?: string
  url?: string
  description?: string
  accent_color?: string
  $?: Cslp
}

export type RteDoc = unknown // JSON RTE document; rendered by jsonRteToHtml

// A modular block is a single-key object (plus optional _metadata). We keep it
// loosely typed and discriminate on the present key at render time.
export interface BlockData {
  text?: RteDoc
  image?: CsAsset | null
  caption?: string
  quote?: string
  attribution?: string
  heading?: string
  body?: string
  tone?: string
  $?: Cslp
}
export type Block = {
  _metadata?: { uid: string }
} & {
  [key: string]: BlockData | { uid: string } | undefined
}

export interface Seo {
  meta_title?: string
  meta_description?: string
  keywords?: string[]
}

export interface BlogPost {
  uid: string
  title: string
  url?: string
  slug?: string
  excerpt?: string
  hero_image?: CsAsset | null
  read_time?: number
  published_date?: string
  topics?: string[]
  body?: RteDoc
  author?: Author[] | Author | null
  category?: Category[] | Category | null
  blocks?: Block[]
  seo?: Seo
  publish_details?: PublishDetails
  $?: Cslp
}

export interface StatItem {
  value?: string
  label?: string
  $?: Cslp
}

export interface LandingPage {
  uid: string
  title: string
  url?: string
  hero_eyebrow?: string
  hero_heading?: string
  hero_subheading?: string
  hero_image?: CsAsset | null
  featured_posts?: BlogPost[]
  stats?: StatItem[]
  seo?: Seo
  $?: Cslp
}

/** Reference fields come back as arrays; normalize to a single object. */
export function one<T>(ref: T[] | T | null | undefined): T | undefined {
  if (!ref) return undefined
  return Array.isArray(ref) ? ref[0] : ref
}
