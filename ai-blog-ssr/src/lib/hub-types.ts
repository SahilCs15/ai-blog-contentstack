// Types for the AI-hub content types (tools, companies, models, news,
// tutorials, glossary, use cases, comparisons, reports). Only fields the UI
// reads are typed; `$` carries live-preview edit tags.

import type { CsAsset, Cslp, RteDoc, Seo } from './types'

export interface AiCategory {
  uid: string
  title: string
  slug?: string
  url?: string
  description?: string
  accent_color?: string
  icon?: string
  hero_image?: CsAsset | null
  $?: Cslp
}

export interface AiCompany {
  uid: string
  title: string
  slug?: string
  url?: string
  logo?: CsAsset | null
  description?: string
  founded_year?: number
  headquarters?: string
  ceo?: string
  website?: string
  featured_products?: string[]
  funding?: string
  industry?: string
  $?: Cslp
}

export interface AiModel {
  uid: string
  title: string
  slug?: string
  url?: string
  developer?: AiCompany[] | AiCompany | null
  release_date?: string
  description?: string
  details?: RteDoc
  context_window?: string
  modalities?: string[]
  strengths?: string[]
  limitations?: string[]
  $?: Cslp
}

export interface AiTool {
  uid: string
  title: string
  slug?: string
  url?: string
  logo?: CsAsset | null
  short_description?: string
  full_description?: RteDoc
  category?: AiCategory[] | AiCategory | null
  company?: AiCompany[] | AiCompany | null
  pricing_model?: string
  website_url?: string
  features?: string[]
  pros?: string[]
  cons?: string[]
  use_cases?: string[]
  rating?: number
  featured?: boolean
  publish_date?: string
  $?: Cslp
}

export interface AiNews {
  uid: string
  title: string
  slug?: string
  url?: string
  excerpt?: string
  body?: RteDoc
  author?: string
  published_date?: string
  featured_image?: CsAsset | null
  topics?: string[]
  related_companies?: AiCompany[]
  category?: AiCategory[] | AiCategory | null
  $?: Cslp
}

export interface TutorialStep {
  heading?: string
  content?: string
  $?: Cslp
}
export interface Tutorial {
  uid: string
  title: string
  slug?: string
  url?: string
  difficulty?: string
  category?: AiCategory[] | AiCategory | null
  introduction?: string
  steps?: TutorialStep[]
  conclusion?: string
  read_time?: number
  $?: Cslp
}

export interface GlossaryTerm {
  uid: string
  title: string
  slug?: string
  url?: string
  definition?: string
  detailed_explanation?: RteDoc
  related_terms?: string[]
  letter?: string
  $?: Cslp
}

export interface UseCase {
  uid: string
  title: string
  slug?: string
  url?: string
  industry?: string
  problem?: string
  solution?: string
  benefits?: string[]
  tools_used?: string[]
  $?: Cslp
}

export interface FeatureRow {
  feature?: string
  value_a?: string
  value_b?: string
  $?: Cslp
}
export interface Comparison {
  uid: string
  title: string
  slug?: string
  url?: string
  tool_a?: string
  tool_b?: string
  overview?: string
  feature_comparison?: FeatureRow[]
  pricing_comparison?: string
  verdict?: string
  $?: Cslp
}

export interface IndustryReport {
  uid: string
  title: string
  slug?: string
  url?: string
  summary?: string
  market_size?: string
  trends?: string[]
  challenges?: string[]
  opportunities?: string[]
  published_date?: string
  $?: Cslp
}

export type { Seo }
