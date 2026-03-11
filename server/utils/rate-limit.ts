import {
  createError,
  getRequestIP,
  getRequestURL,
  setHeader,
  type H3Event,
} from 'h3'

interface RateLimitRule {
  id: string
  max: number
  windowMs: number
}

interface RateLimitBucket {
  count: number
  resetAt: number
}

const rateLimitBuckets = new Map<string, RateLimitBucket>()

const DEFAULT_RULE: RateLimitRule = {
  id: 'api-default',
  max: 180,
  windowMs: 60_000,
}

const ROUTE_RULES: Array<{
  matches: (pathname: string, method: string) => boolean
  rule: RateLimitRule
}> = [
  {
    matches: pathname => pathname.startsWith('/api/auth/'),
    rule: {
      id: 'auth',
      max: 12,
      windowMs: 60_000,
    },
  },
  {
    matches: (pathname, method) => pathname === '/api/palettes' && method === 'POST',
    rule: {
      id: 'palettes-create',
      max: 20,
      windowMs: 60_000,
    },
  },
  {
    matches: (pathname, method) => /^\/api\/palettes\/[^/]+\/visibility$/.test(pathname) && method === 'PATCH',
    rule: {
      id: 'palettes-visibility',
      max: 30,
      windowMs: 60_000,
    },
  },
  {
    matches: (pathname, method) => /^\/api\/palettes\/[^/]+$/.test(pathname) && ['PUT', 'DELETE'].includes(method),
    rule: {
      id: 'palettes-write',
      max: 30,
      windowMs: 60_000,
    },
  },
  {
    matches: pathname => pathname.startsWith('/api/palettes/slug/'),
    rule: {
      id: 'palettes-public-read',
      max: 120,
      windowMs: 60_000,
    },
  },
  {
    matches: (pathname, method) => pathname === '/api/palettes' && method === 'GET',
    rule: {
      id: 'palettes-list',
      max: 90,
      windowMs: 60_000,
    },
  },
]

function pruneExpiredBuckets(now: number) {
  for (const [key, bucket] of rateLimitBuckets.entries()) {
    if (bucket.resetAt <= now) {
      rateLimitBuckets.delete(key)
    }
  }
}

function getRateLimitKey(event: H3Event, rule: RateLimitRule) {
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? event.node.req.socket.remoteAddress ?? 'unknown'
  return `${rule.id}:${ip}`
}

export function resolveRateLimitRule(event: H3Event) {
  const pathname = getRequestURL(event).pathname
  const method = event.node.req.method?.toUpperCase() ?? 'GET'

  return ROUTE_RULES.find(({ matches }) => matches(pathname, method))?.rule ?? DEFAULT_RULE
}

export function clearRateLimitBuckets() {
  rateLimitBuckets.clear()
}

export function enforceRateLimit(event: H3Event, now = Date.now()) {
  pruneExpiredBuckets(now)

  const rule = resolveRateLimitRule(event)
  const key = getRateLimitKey(event, rule)
  const existingBucket = rateLimitBuckets.get(key)
  const bucket = !existingBucket || existingBucket.resetAt <= now
    ? {
        count: 0,
        resetAt: now + rule.windowMs,
      }
    : existingBucket

  bucket.count += 1
  rateLimitBuckets.set(key, bucket)

  const remaining = Math.max(rule.max - bucket.count, 0)
  const resetInSeconds = Math.max(Math.ceil((bucket.resetAt - now) / 1000), 0)

  setHeader(event, 'X-RateLimit-Limit', String(rule.max))
  setHeader(event, 'X-RateLimit-Remaining', String(remaining))
  setHeader(event, 'X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)))

  if (bucket.count > rule.max) {
    setHeader(event, 'Retry-After', resetInSeconds)

    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests',
      data: {
        retryAfter: resetInSeconds,
      },
    })
  }
}
