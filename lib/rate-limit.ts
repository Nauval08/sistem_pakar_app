type Bucket = { count: number; first: number }
const WINDOW_MS = 60_000
const MAX_REQ = 30

declare global {
  // eslint-disable-next-line no-var
  var __rate_map__: Map<string, Bucket> | undefined
}

const store = globalThis.__rate_map__ ?? new Map<string, Bucket>()
if (!globalThis.__rate_map__) globalThis.__rate_map__ = store

export function getClientIp(headers: Headers) {
  const fwd = headers.get("x-forwarded-for") || ""
  const ip = fwd.split(",")[0].trim() || "unknown"
  return ip
}

export function rateLimit(key: string, max = MAX_REQ, windowMs = WINDOW_MS) {
  const now = Date.now()
  const b = store.get(key)
  if (!b) {
    store.set(key, { count: 1, first: now })
    return { ok: true }
  }
  if (now - b.first > windowMs) {
    store.set(key, { count: 1, first: now })
    return { ok: true }
  }
  if (b.count >= max) {
    return { ok: false, retryAfterMs: windowMs - (now - b.first) }
  }
  b.count++
  return { ok: true }
}
