// Shared loading / error / empty states. The error state renders the full
// Contentstack API failure on-page (status, error_code, error_message, the
// request context, and raw payload) so issues are debuggable without devtools.

import type { CsErrorDetail } from '../lib/cs-error'

export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="state">
      <div className="spinner" aria-hidden />
      <p>{label}</p>
    </div>
  )
}

export function ErrorState({ message, error }: { message?: string; error?: CsErrorDetail }) {
  const detail: CsErrorDetail = error ?? { message: message ?? 'Unknown error' }
  const headline = detail.errorMessage || detail.message || 'Request failed'

  return (
    <div className="state state--error">
      <h2>⚠️ Couldn’t load content</h2>
      <p className="errcard__headline">{headline}</p>

      <div className="errcard">
        <div className="errcard__rows">
          {detail.status !== undefined && <Row k="HTTP status" v={String(detail.status)} />}
          {detail.errorCode !== undefined && <Row k="error_code" v={String(detail.errorCode)} />}
          {detail.errorMessage && <Row k="error_message" v={detail.errorMessage} />}
          {detail.context &&
            Object.entries(detail.context).map(([k, v]) => <Row key={k} k={k} v={v ?? '—'} />)}
        </div>

        {detail.errors ? (
          <>
            <div className="errcard__label">errors</div>
            <pre className="errcard__pre">{stringify(detail.errors)}</pre>
          </>
        ) : null}

        {detail.raw ? (
          <details className="errcard__details">
            <summary>Raw response</summary>
            <pre className="errcard__pre">{detail.raw}</pre>
          </details>
        ) : null}
      </div>

      <p className="state__hint">{hintFor(detail)}</p>
    </div>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="errcard__row">
      <span className="errcard__key">{k}</span>
      <span className="errcard__val">{v}</span>
    </div>
  )
}

/** Tailored next-step hint based on the Contentstack error_code. */
function hintFor(d: CsErrorDetail): string {
  const code = Number(d.errorCode)
  if (code === 141) return 'The access/delivery token does not have access to this environment. Point the app at an environment the token is scoped to (and that has published content).'
  if (code === 109 || d.status === 422) return 'Stack not found or bad parameters — check the API key, region host, and environment name.'
  if (code === 105 || d.status === 401) return 'Authentication failed — verify the delivery/preview token.'
  if (d.status === 404) return 'Not found — the content type or entry may not exist, or isn’t published to this environment.'
  if (!d.context?.apiKey || d.context.apiKey.includes('missing')) return 'Credentials look unset — copy .env.example to .env and fill in your stack details.'
  return 'Check the API key, delivery/preview tokens, region hosts, and that the entry is published to the selected environment.'
}

function stringify(v: unknown): string {
  try {
    return JSON.stringify(v, null, 2)
  } catch {
    return String(v)
  }
}

export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="state">
      <h2>{title}</h2>
      {hint && <p className="state__hint">{hint}</p>}
    </div>
  )
}
