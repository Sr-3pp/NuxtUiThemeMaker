export interface RateLimitRule {
  id: string
  max: number
  windowMs: number
}

export interface RateLimitBucket {
  count: number
  resetAt: number
}
