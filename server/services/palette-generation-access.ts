import { createError } from 'h3'
import { isPaidPricingPlanId } from '../../app/data/pricing'
import type { PaletteGenerationAccess } from '~/types/palette-generation'
import { incrementAiPaletteGenerationsUsed } from '~~/server/db/repositories/user-repository'
import type { AuthSession, AuthSessionUser } from '~~/server/types/auth-session'

export const FREE_PALETTE_GENERATION_LIMIT = 3
export const PRO_PALETTE_GENERATION_LIMIT = 15

function hasActivePaidPlan(user: AuthSessionUser) {
  return isPaidPricingPlanId(user.plan) && ['active', 'trialing'].includes(user.planStatus)
}

function hasPaidUnlimitedAccess(user: AuthSessionUser) {
  return user.plan === 'studio' && ['active', 'trialing'].includes(user.planStatus)
}

function hasAdminUnlimitedAccess(user: AuthSessionUser) {
  return user.isAdmin
}

function getGenerationLimit(user: AuthSessionUser) {
  if (!hasActivePaidPlan(user)) {
    return FREE_PALETTE_GENERATION_LIMIT
  }

  if (user.plan === 'pro') {
    return PRO_PALETTE_GENERATION_LIMIT
  }

  return null
}

export function getPaletteGenerationAccess(session: AuthSession | null): PaletteGenerationAccess {
  if (!session) {
    return {
      canGenerate: false,
      isPaidUnlimited: false,
      isAdminUnlimited: false,
      freeLimit: FREE_PALETTE_GENERATION_LIMIT,
      freeUsed: 0,
      freeRemaining: FREE_PALETTE_GENERATION_LIMIT,
      reason: 'unauthenticated',
    }
  }

  const isPaidUnlimited = hasPaidUnlimitedAccess(session.user)
  const isAdminUnlimited = hasAdminUnlimitedAccess(session.user)
  const used = session.user.aiPaletteGenerationsUsed ?? 0
  const limit = getGenerationLimit(session.user)
  const remaining = limit === null ? null : Math.max(limit - used, 0)

  if (isPaidUnlimited || isAdminUnlimited || (remaining !== null && remaining > 0)) {
    return {
      canGenerate: true,
      isPaidUnlimited,
      isAdminUnlimited,
      freeLimit: limit ?? PRO_PALETTE_GENERATION_LIMIT,
      freeUsed: used,
      freeRemaining: remaining ?? PRO_PALETTE_GENERATION_LIMIT,
      reason: 'allowed',
    }
  }

  return {
    canGenerate: false,
    isPaidUnlimited: false,
    isAdminUnlimited: false,
    freeLimit: limit ?? FREE_PALETTE_GENERATION_LIMIT,
    freeUsed: used,
    freeRemaining: remaining ?? 0,
    reason: 'free_limit_reached',
  }
}

export function assertPaletteGenerationAllowed(session: AuthSession | null) {
  const access = getPaletteGenerationAccess(session)

  if (access.reason === 'unauthenticated') {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required',
    })
  }

  if (!access.canGenerate) {
    throw createError({
      statusCode: 403,
      statusMessage: `Your plan only includes ${access.freeLimit} AI palette generations`,
    })
  }

  return access
}

export async function incrementPaletteGenerationUsageIfNeeded(session: AuthSession, access: PaletteGenerationAccess) {
  if (access.isPaidUnlimited || access.isAdminUnlimited) {
    return
  }

  const updatedUser = await incrementAiPaletteGenerationsUsed(session.user.id)

  if (!updatedUser) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update palette generation usage',
    })
  }
}
