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

export interface Shoe {
  uid: string
  title: string
  slug?: string
  price?: number
  rating?: number
  badge?: string
  accent_color?: string
  short_description?: string
  image?: CsAsset | null
  $?: Cslp
}

export interface ShoeTestimonial {
  customer_name?: string
  customer_role?: string
  quote?: string
  avatar?: CsAsset | null
  $?: Cslp
}

export interface ShoeNavLink {
  label?: string
  link?: string
  $?: Cslp
}

/** Link field: { title, href }. */
export interface CsLink {
  title?: string
  href?: string
  $?: Cslp
}

/** One promise inside the Brand Promise global field's repeating group. */
export interface ShoePromise {
  heading?: string
  description?: string
  icon?: CsAsset | null
  $?: Cslp
}

/** Brand Promise global field. */
export interface ShoeBrandPromise {
  section_heading?: string
  section_subtext?: string
  promises?: ShoePromise[]
  $?: Cslp
}

/** Group nested two levels deep inside the Store Info group. */
export interface ShoeTransit {
  station?: string
  walk_minutes?: number
  $?: Cslp
}

/** Group nested inside the Store Info group. */
export interface ShoeGeo {
  latitude?: string
  longitude?: string
  has_parking?: boolean
  nearest_transit?: ShoeTransit
  $?: Cslp
}

/** Non-repeating Store Info group. */
export interface ShoeStoreInfo {
  address?: string
  phone?: string
  email?: string
  opening_hours?: string
  years_in_business?: number
  map_link?: CsLink
  // ---- containers nested inside a group ----
  geo?: ShoeGeo // group inside a group
  staff_pick?: Shoe[] | Shoe | null // single reference inside a group
  counter_promise?: ShoeBrandPromise // global field inside a group
  $?: Cslp
}

/** A taxonomy term reference on the entry. */
export interface ShoeTaxonomyTerm {
  taxonomy_uid?: string
  term_uid?: string
}

// ---- Modular block variants for the Flexible Sections field ----
export interface FeatureBannerBlock {
  heading?: string
  subtext?: string
  image?: CsAsset | null
  cta?: CsLink
  align?: string
  $?: Cslp
}
export interface SpecHighlightBlock {
  label?: string
  value?: number
  unit?: string
  $?: Cslp
}
export interface LookbookBlock {
  caption?: string
  images?: CsAsset[]
  $?: Cslp
}
export interface FaqBlock {
  question?: string
  answer?: string
  $?: Cslp
}

/** Inner blocks of the Nested Showcase block (modular blocks inside a block). */
export interface CopyPanelBlock {
  panel_heading?: string
  panel_body?: string
  $?: Cslp
}
export interface MediaPanelBlock {
  panel_image?: CsAsset | null
  panel_cta?: CsLink
  $?: Cslp
}
export interface ShowcasePanel {
  copy_panel?: CopyPanelBlock
  media_panel?: MediaPanelBlock
  _metadata?: { uid: string }
}

/** Detail group nested inside the Nested Showcase block. */
export interface ShowcaseInner {
  note?: string
  $?: Cslp
}
export interface ShowcaseDetail {
  label?: string
  weight_grams?: number
  inner?: ShowcaseInner
  $?: Cslp
}

/**
 * The Nested Showcase block carries one of every container type inside a single
 * modular block: a nested group, a global field, single and multiple references,
 * multiple assets, and its own modular-blocks field.
 */
export interface NestedShowcaseBlock {
  heading?: string
  theme?: string
  detail?: ShowcaseDetail
  promise?: ShoeBrandPromise
  linked_shoe?: Shoe[] | Shoe | null
  linked_reads?: Array<Shoe & { _content_type_uid?: string }>
  stills?: CsAsset[]
  panels?: ShowcasePanel[]
  $?: Cslp
}

export interface PromoNoteBlock {
  heading?: string
  body?: string
  $?: Cslp
}

export interface PromoStatBlock {
  label?: string
  value?: number
  $?: Cslp
}

export interface PromoBlock {
  promo_note?: PromoNoteBlock
  promo_stat?: PromoStatBlock
  _metadata?: { uid: string }
  $?: Cslp
}

export interface ShoeSectionBlock {
  feature_banner?: FeatureBannerBlock
  spec_highlight?: SpecHighlightBlock
  lookbook?: LookbookBlock
  faq?: FaqBlock
  nested_showcase?: NestedShowcaseBlock
  _metadata?: { uid: string }
}

/** A resolved embedded entry from the Size & Care JSON RTE, keyed by uid. */
export interface GuideEmbed {
  uid: string
  title?: string
  price?: number
  image?: CsAsset | null
}

export interface ShoeLanding {
  uid: string
  title: string
  url?: string
  brand_name?: string
  hero_heading?: string
  hero_highlight?: string
  hero_subtext?: string
  hero_cta_label?: string
  hero_image?: CsAsset | null
  stat_value?: string
  stat_label?: string
  promo_label?: string
  featured_shoes?: Shoe[]
  testimonials?: ShoeTestimonial[]
  newsletter_heading?: string
  newsletter_subtext?: string
  footer_note?: string
  nav_links?: ShoeNavLink[]
  // ---- every core field type, shoe-themed ----
  usp_chips?: string[] // multi-value text
  collection?: string // select (dropdown)
  available_sizes?: string[] // select (checkbox, multiple)
  products_in_stock?: number // number
  free_shipping?: boolean // boolean
  drop_date?: string // isodate
  brand_story?: string // rich text (HTML)
  size_care_guide?: RteDoc // JSON RTE (with embeds)
  care_instructions?: string // markdown
  gallery?: CsAsset[] // multiple assets
  size_guide_link?: CsLink // link
  related_products?: Shoe[] // reference (multi content-type)
  store_info?: ShoeStoreInfo // group
  brand_promise?: ShoeBrandPromise // global field
  sections?: ShoeSectionBlock[] // modular blocks
  promo_blocks?: PromoBlock[] // modular blocks, empty by default
  taxonomies?: ShoeTaxonomyTerm[] // taxonomy
  collection_code?: string // custom extension
  // ---- the same types again in their other cardinality ----
  spotlight_shoe?: Shoe[] | Shoe | null // reference, single
  price_tiers?: number[] // number, multiple
  in_stock_flags?: boolean[] // boolean, multiple
  restock_dates?: string[] // isodate, multiple
  retailer_links?: CsLink[] // link, multiple
  shipping_notes?: string[] // multiline text, multiple
  material_notes?: string[] // markdown, multiple
  campaign_copy?: string[] // rich text (HTML), multiple
  press_notes?: RteDoc[] // JSON RTE, multiple
  promise_sections?: ShoeBrandPromise[] // global field, multiple
  region_codes?: string // custom extension (extension fields cannot be multiple)
  /** Entry embeds resolved from size_care_guide, keyed by entry uid. */
  _guide_embeds?: Record<string, GuideEmbed>
  $?: Cslp
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
