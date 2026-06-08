// Normalizes whatever the Contentstack SDK / fetch throws into a structured
// shape the UI can render in full, so API failures are debuggable on-page
// (status code, Contentstack error_code/error_message, and the request context).

export interface CsErrorDetail {
  message: string
  status?: number
  errorCode?: number | string
  errorMessage?: string
  errors?: unknown
  context?: Record<string, string | undefined>
  raw?: string
}

function pick(obj: unknown, key: string): unknown {
  return obj && typeof obj === 'object' ? (obj as Record<string, unknown>)[key] : undefined
}

/**
 * Build a structured error from anything thrown by the delivery SDK or fetch.
 * The SDK typically throws an object/Error whose message is a JSON string like
 * {"error_message":"...","error_code":141,"errors":{...}} or an axios-style
 * error with `.response.status` and `.response.data`.
 */
export function toCsError(err: unknown, context?: Record<string, string | undefined>): CsErrorDetail {
  const detail: CsErrorDetail = { message: 'Request failed', context }

  // axios-style: err.response.{status,data}
  const response = pick(err, 'response')
  if (response) {
    detail.status = pick(response, 'status') as number | undefined
    const data = pick(response, 'data')
    if (data) {
      detail.errorMessage = pick(data, 'error_message') as string | undefined
      detail.errorCode = pick(data, 'error_code') as number | string | undefined
      detail.errors = pick(data, 'errors')
      detail.raw = safeStringify(data)
    }
  }

  // Error instance: message may itself be a JSON CS error payload
  const rawMsg = err instanceof Error ? err.message : typeof err === 'string' ? err : ''
  if (rawMsg) {
    detail.message = rawMsg
    const parsed = tryParseJson(rawMsg)
    if (parsed) {
      detail.errorMessage = (pick(parsed, 'error_message') as string) ?? detail.errorMessage
      detail.errorCode = (pick(parsed, 'error_code') as number | string) ?? detail.errorCode
      detail.errors = pick(parsed, 'errors') ?? detail.errors
      detail.status = (pick(parsed, 'status') as number) ?? detail.status
      detail.raw = detail.raw ?? safeStringify(parsed)
    }
  }

  // Direct CS payload thrown as a plain object
  if (!rawMsg && err && typeof err === 'object') {
    detail.errorMessage = (pick(err, 'error_message') as string) ?? detail.errorMessage
    detail.errorCode = (pick(err, 'error_code') as number | string) ?? detail.errorCode
    detail.errors = pick(err, 'errors') ?? detail.errors
    detail.status = (pick(err, 'status') as number) ?? detail.status
    detail.raw = detail.raw ?? safeStringify(err)
  }

  // Prefer the human CS message for the headline if we have one
  if (detail.errorMessage) detail.message = detail.errorMessage
  return detail
}

function tryParseJson(s: string): unknown {
  const t = s.trim()
  if (!t.startsWith('{') && !t.startsWith('[')) return null
  try {
    return JSON.parse(t)
  } catch {
    return null
  }
}

function safeStringify(v: unknown): string {
  try {
    return JSON.stringify(v, null, 2)
  } catch {
    return String(v)
  }
}
