import { createEvent, getResponseHeader } from 'h3'
import { afterEach, describe, expect, it } from 'vitest'
import {
  clearRateLimitBuckets,
  enforceRateLimit,
  resolveRateLimitRule,
} from '~~/server/utils/rate-limit'

function createApiEvent(path: string, method: string, ip = '203.0.113.10') {
  const headers = new Map<string, string>()
  const req = {
    method,
    url: path,
    headers: {
      'x-forwarded-for': ip,
    },
    socket: {
      remoteAddress: ip,
    },
  }
  const res = {
    writableEnded: false,
    headersSent: false,
    setHeader(name: string, value: string) {
      headers.set(name.toLowerCase(), value)
    },
    getHeader(name: string) {
      return headers.get(name.toLowerCase())
    },
  }

  return createEvent(req as never, res as never)
}

describe('rate limit utilities', () => {
  afterEach(() => {
    clearRateLimitBuckets()
  })

  it('uses the auth rule for auth endpoints', () => {
    const event = createApiEvent('/api/auth/sign-in/email', 'POST')

    expect(resolveRateLimitRule(event)).toMatchObject({
      id: 'auth',
      max: 12,
      windowMs: 60_000,
    })
  })

  it('uses the stricter write rule for palette mutations', () => {
    const event = createApiEvent('/api/palettes/abc123', 'DELETE')

    expect(resolveRateLimitRule(event)).toMatchObject({
      id: 'palettes-write',
      max: 30,
      windowMs: 60_000,
    })
  })

  it('throws a 429 when the bucket is exhausted', () => {
    const event = createApiEvent('/api/auth/sign-in/email', 'POST')
    const now = Date.now()

    for (let attempt = 0; attempt < 12; attempt += 1) {
      enforceRateLimit(event, now)
    }

    try {
      enforceRateLimit(event, now)
      throw new Error('Expected the rate limiter to throw')
    }
    catch (error) {
      expect(error).toMatchObject({
        statusCode: 429,
        statusMessage: 'Too many requests',
      })
    }
    expect(getResponseHeader(event, 'X-RateLimit-Limit')).toBe('12')
    expect(getResponseHeader(event, 'X-RateLimit-Remaining')).toBe('0')
    expect(getResponseHeader(event, 'Retry-After')).toBe('60')
  })
})
