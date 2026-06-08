// Shared loading / error / empty states so every page handles the live-preview
// edge cases consistently (no content yet, fetch error, draft entry, etc.).

export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="state">
      <div className="spinner" aria-hidden />
      <p>{label}</p>
    </div>
  )
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="state state--error">
      <h2>Something went wrong</h2>
      <p>{message}</p>
      <p className="state__hint">
        Check the API key, delivery/preview tokens, and that the entry is published
        to the <code>development</code> environment.
      </p>
    </div>
  )
}

export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="state">
      <h2>{title}</h2>
      {hint && <p className="state__hint">{hint}</p>}
    </div>
  )
}
