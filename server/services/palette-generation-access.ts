import { createError } from 'h3'
import {
  FREE_PLAN_PALETTE_GENERATION_LIMIT,
  getEffectivePaletteGenerationLimit,
} from '../../shared/data/limits'
import type { PaletteGenerationAccess } from '~/types/palette-generation'
import { incrementAiPaletteGenerationsUsed } from '~~/server/db/repositories/user-repository'
import type { AuthSession, AuthSessionUser } from '~~/server/types/auth-session'

function hasAdminUnlimitedAccess(user: AuthSessionUser) {
  return user.isAdmin
}

export function getPaletteGenerationAccess(session: AuthSession | null): PaletteGenerationAccess {
  if (!session) {
    return {
      canGenerate: false,
      isPaidUnlimited: false,
      isAdminUnlimited: false,
      freeLimit: FREE_PLAN_PALETTE_GENERATION_LIMIT,
      freeUsed: 0,
      freeRemaining: FREE_PLAN_PALETTE_GENERATION_LIMIT,
      reason: 'unauthenticated',
    }
  }

  const isPaidUnlimited = false
  const isAdminUnlimited = hasAdminUnlimitedAccess(session.user)
  const used = session.user.aiPaletteGenerationsUsed ?? 0
  const limit = getEffectivePaletteGenerationLimit(session.user)
  const remaining = limit === null ? null : Math.max(limit - used, 0)

  if (isPaidUnlimited || isAdminUnlimited || (remaining !== null && remaining > 0)) {
    return {
      canGenerate: true,
      isPaidUnlimited,
      isAdminUnlimited,
      freeLimit: limit ?? FREE_PLAN_PALETTE_GENERATION_LIMIT,
      freeUsed: used,
      freeRemaining: remaining ?? FREE_PLAN_PALETTE_GENERATION_LIMIT,
      reason: 'allowed',
    }
  }

  return {
    canGenerate: false,
    isPaidUnlimited: false,
    isAdminUnlimited: false,
    freeLimit: limit ?? FREE_PLAN_PALETTE_GENERATION_LIMIT,
    freeUsed: used,
    freeRemaining: remaining ?? 0,
    reason: 'free_limit_reached',
  }
}

export function assertPaletteGenerationAllowed(session: AuthSession | null) {
  const access = getPaletteGenerationAccess(session)

  if (!access.canGenerate) {
    if (access.reason === 'unauthenticated') {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required for AI palette generation',
      })
    }

    throw createError({
      statusCode: 403,
      statusMessage: `Your plan only includes ${access.freeLimit} AI runs`,
    })
  }

  return access
}

export async function incrementPaletteGenerationUsageIfNeeded(session: AuthSession | null, access: PaletteGenerationAccess) {
  if (!session) {
    return
  }

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
