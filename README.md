# Synapse — AI Technology Hub (CSR + SSR)

Two reference applications that consume the same Contentstack stack and
demonstrate **Contentstack Live Preview** in both client-side and server-side
rendering modes.

| App | Stack | Rendering | Live URL | Local port |
|-----|-------|-----------|----------|------------|
| [`ai-blog-csr`](./ai-blog-csr) | Vite + React Router | Client-side (SPA) | https://ai-blog-csr.vercel.app | 3010 |
| [`ai-blog-ssr`](./ai-blog-ssr) | Next.js App Router | Server-side | https://ai-blog-ssr.vercel.app | 3011 |

Both render a multi-page AI knowledge hub: tools directory, AI models,
companies, news, tutorials, an A–Z glossary, comparisons, use cases, and
industry reports — all sourced from Contentstack with live-preview edit tags.

## Content model

Created in the connected stack: `ai_tool`, `ai_category`, `ai_company`,
`ai_model`, `ai_news`, `tutorial`, `glossary_term`, `use_case`, `comparison`,
`industry_report`, plus a `page` (homepage) type and the original `blog_post`
/ `author` / `category` blog types.

## Running locally

Each app reads its Contentstack config from environment variables (see each
app's `.env.example`). Copy it to `.env` and fill in your stack's credentials:

```bash
# CSR
cd ai-blog-csr && cp .env.example .env && npm install && npm run dev   # http://localhost:3010

# SSR
cd ai-blog-ssr && cp .env.example .env && npm install && npm run dev   # http://localhost:3011
```

## Live Preview

Both apps integrate `@contentstack/live-preview-utils`:

- **CSR** initializes Live Preview once at startup, then re-fetches on
  `onEntryChange` (so the first in-iframe fetch carries the `live_preview` hash).
- **SSR** initializes in `ssr: true` mode and calls `router.refresh()` on entry
  change to re-run the server render with the live-preview hash from the URL.

Register the deployed URL on the Contentstack environment that holds your
published content, then open an entry → Live Preview.

## Deployment

Both are deployed on Vercel. The CSR app includes a `vercel.json` SPA rewrite so
deep links resolve to `index.html`. The SSR app deploys as a standard Next.js
project.

> **Note:** Provide credentials via environment variables in production
> (Vercel project settings). Do not commit real tokens.
