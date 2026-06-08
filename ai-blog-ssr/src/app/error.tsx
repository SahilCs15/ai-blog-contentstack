'use client'

// Root error boundary. Server fetchers throw an Error whose message carries the
// serialized Contentstack failure detail (see asThrowable). We parse it back and
// render the full error on-page so API issues are debuggable without devtools.

import { parseCsError } from '@/lib/cs-error'
import { ErrorState } from '@/components/States'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const detail = parseCsError(error)
  return (
    <div className="main">
      <ErrorState error={detail} />
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <button className="btn" onClick={() => reset()}>Try again</button>
      </div>
    </div>
  )
}
