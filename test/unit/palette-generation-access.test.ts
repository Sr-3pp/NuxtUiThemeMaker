import { describe, expect, it, vi } from 'vitest'
import type { PricingPlanId } from '../../app/types/pricing'
import {
  FREE_PLAN_PALETTE_GENERATION_LIMIT,
  PRO_PLAN_PALETTE_GENERATION_LIMIT,
  TEAMS_PLAN_PALETTE_GENERATION_LIMIT,
} from '../../app/data/pricing'
import { getPaletteGenerationAccess } from '../../server/services/palette-generation-access'

vi.mock('h3', () => ({
  createError: (input: { statusCode: number, statusMessage: string }) =>
    Object.assign(new Error(input.statusMessage), input),
}))

vi.mock('~~/server/db/repositories/user-repository', () => ({
  incrementAiPaletteGenerationsUsed: vi.fn(),
}))

function createSession(overrides: Partial<{
  isAdmin: boolean
  plan: PricingPlanId
  planStatus: 'inactive' | 'trialing' | 'active' | 'past_due' | 'canceled'
  aiPaletteGenerationsUsed: number
}> = {}) {
  return {
    user: {
      id: 'user-1',
      isAdmin: overrides.isAdmin ?? false,
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
      freeLimit: FREE_PLAN_PALETTE_GENERATION_LIMIT,
      freeUsed: 0,
      freeRemaining: FREE_PLAN_PALETTE_GENERATION_LIMIT,
      reason: 'unauthenticated',
    })
  })

  it('allows free users while they still have generations remaining', () => {
    expect(getPaletteGenerationAccess(createSession({ aiPaletteGenerationsUsed: 2 }))).toEqual({
      canGenerate: true,
      isPaidUnlimited: false,
      isAdminUnlimited: false,
      freeLimit: FREE_PLAN_PALETTE_GENERATION_LIMIT,
      freeUsed: 2,
      freeRemaining: 3,
      reason: 'allowed',
    })
  })

  it('blocks free users once they reach the limit', () => {
    expect(getPaletteGenerationAccess(createSession({ aiPaletteGenerationsUsed: 5 }))).toEqual({
      canGenerate: false,
      isPaidUnlimited: false,
      isAdminUnlimited: false,
      freeLimit: FREE_PLAN_PALETTE_GENERATION_LIMIT,
      freeUsed: 5,
      freeRemaining: 0,
      reason: 'free_limit_reached',
    })
  })

  it('grants capped access to pro users with active status', () => {
    const access = getPaletteGenerationAccess(createSession({
      plan: 'pro',
      planStatus: 'active',
      aiPaletteGenerationsUsed: 5,
    }))

    expect(access.canGenerate).toBe(true)
    expect(access.isPaidUnlimited).toBe(false)
    expect(access.isAdminUnlimited).toBe(false)
    expect(access.freeLimit).toBe(PRO_PLAN_PALETTE_GENERATION_LIMIT)
    expect(access.freeRemaining).toBe(55)
    expect(access.reason).toBe('allowed')
  })

  it('blocks pro users after they reach the plan generation limit', () => {
    const access = getPaletteGenerationAccess(createSession({
      plan: 'pro',
      planStatus: 'active',
      aiPaletteGenerationsUsed: 60,
    }))

    expect(access.canGenerate).toBe(false)
    expect(access.isPaidUnlimited).toBe(false)
    expect(access.isAdminUnlimited).toBe(false)
    expect(access.freeLimit).toBe(PRO_PLAN_PALETTE_GENERATION_LIMIT)
    expect(access.freeRemaining).toBe(0)
    expect(access.reason).toBe('free_limit_reached')
  })

  it('falls back to free-tier limits when a paid plan is inactive', () => {
    const access = getPaletteGenerationAccess(createSession({
      plan: 'pro',
      planStatus: 'canceled',
      aiPaletteGenerationsUsed: 5,
    }))

    expect(access.canGenerate).toBe(false)
    expect(access.isPaidUnlimited).toBe(false)
    expect(access.isAdminUnlimited).toBe(false)
    expect(access.reason).toBe('free_limit_reached')
  })

  it('grants capped access to active teams users', () => {
    const access = getPaletteGenerationAccess(createSession({
      plan: 'teams',
      planStatus: 'active',
      aiPaletteGenerationsUsed: 299,
    }))

    expect(access.canGenerate).toBe(true)
    expect(access.isPaidUnlimited).toBe(false)
    expect(access.isAdminUnlimited).toBe(false)
    expect(access.freeLimit).toBe(TEAMS_PLAN_PALETTE_GENERATION_LIMIT)
    expect(access.freeRemaining).toBe(1)
    expect(access.reason).toBe('allowed')
  })

  it('grants unlimited access to admin users', () => {
    const access = getPaletteGenerationAccess(createSession({
      isAdmin: true,
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
