import { describe, expect, it } from 'vitest'
import { vi } from 'vitest'

vi.mock('h3', () => ({
  createError: (input: { statusCode: number, statusMessage: string }) =>
    Object.assign(new Error(input.statusMessage), input),
}))

vi.mock('~~/server/db/repositories/user-repository', () => ({
  incrementAiPaletteGenerationsUsed: vi.fn(),
}))

import {
  FREE_PALETTE_GENERATION_LIMIT,
  getPaletteGenerationAccess,
} from '../../server/services/palette-generation-access'

function createSession(overrides: Partial<{
  level: 'user' | 'admin'
  plan: 'free' | 'pro' | 'team'
  planStatus: 'inactive' | 'trialing' | 'active' | 'past_due' | 'canceled'
  aiPaletteGenerationsUsed: number
}> = {}) {
  return {
    user: {
      id: 'user-1',
      level: overrides.level ?? 'user',
      plan: overrides.plan ?? 'free',
      planStatus: overrides.planStatus ?? 'inactive',
      aiPaletteGenerationsUsed: overrides.aiPaletteGenerationsUsed ?? 0,
    },
  } as never
}

describe('palette generation access', () => {
  it('returns an unauthenticated response for guests', () => {
    expect(getPaletteGenerationAccess(null)).toEqual({
      canGenerate: false,
      isPaidUnlimited: false,
      isAdminUnlimited: false,
      freeLimit: FREE_PALETTE_GENERATION_LIMIT,
      freeUsed: 0,
      freeRemaining: FREE_PALETTE_GENERATION_LIMIT,
      reason: 'unauthenticated',
    })
  })

  it('allows free users while they still have generations remaining', () => {
    expect(getPaletteGenerationAccess(createSession({ aiPaletteGenerationsUsed: 2 }))).toEqual({
      canGenerate: true,
      isPaidUnlimited: false,
      isAdminUnlimited: false,
      freeLimit: FREE_PALETTE_GENERATION_LIMIT,
      freeUsed: 2,
      freeRemaining: 1,
      reason: 'allowed',
    })
  })

  it('blocks free users once they reach the limit', () => {
    expect(getPaletteGenerationAccess(createSession({ aiPaletteGenerationsUsed: 3 }))).toEqual({
      canGenerate: false,
      isPaidUnlimited: false,
      isAdminUnlimited: false,
      freeLimit: FREE_PALETTE_GENERATION_LIMIT,
      freeUsed: 3,
      freeRemaining: 0,
      reason: 'free_limit_reached',
    })
  })

  it('grants unlimited access to paid users with active status', () => {
    const access = getPaletteGenerationAccess(createSession({
      plan: 'pro',
      planStatus: 'active',
      aiPaletteGenerationsUsed: 99,
    }))

    expect(access.canGenerate).toBe(true)
    expect(access.isPaidUnlimited).toBe(true)
    expect(access.isAdminUnlimited).toBe(false)
    expect(access.reason).toBe('allowed')
  })

  it('falls back to free-tier limits when a paid plan is inactive', () => {
    const access = getPaletteGenerationAccess(createSession({
      plan: 'team',
      planStatus: 'canceled',
      aiPaletteGenerationsUsed: 3,
    }))

    expect(access.canGenerate).toBe(false)
    expect(access.isPaidUnlimited).toBe(false)
    expect(access.isAdminUnlimited).toBe(false)
    expect(access.reason).toBe('free_limit_reached')
  })

  it('grants unlimited access to admin users', () => {
    const access = getPaletteGenerationAccess(createSession({
      level: 'admin',
      plan: 'free',
      planStatus: 'inactive',
      aiPaletteGenerationsUsed: 99,
    }))

    expect(access.canGenerate).toBe(true)
    expect(access.isPaidUnlimited).toBe(false)
    expect(access.isAdminUnlimited).toBe(true)
    expect(access.reason).toBe('allowed')
  })
})
