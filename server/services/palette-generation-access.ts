import { createError } from 'h3'
import type { PaletteGenerationAccess } from '~/types/palette-generation'
import { incrementAiPaletteGenerationsUsed } from '~~/server/db/repositories/user-repository'
import type { AuthSession, AuthSessionUser } from '~~/server/types/auth-session'

export const FREE_PALETTE_GENERATION_LIMIT = 3

function hasPaidUnlimitedAccess(user: AuthSessionUser) {
  return ['pro', 'team'].includes(user.plan) && ['active', 'trialing'].includes(user.planStatus)
}

function hasAdminUnlimitedAccess(user: AuthSessionUser) {
  return user.level === 'admin'
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
  const freeUsed = session.user.aiPaletteGenerationsUsed ?? 0
  const freeRemaining = Math.max(FREE_PALETTE_GENERATION_LIMIT - freeUsed, 0)

  if (isPaidUnlimited || isAdminUnlimited || freeRemaining > 0) {
    return {
      canGenerate: true,
      isPaidUnlimited,
      isAdminUnlimited,
      freeLimit: FREE_PALETTE_GENERATION_LIMIT,
      freeUsed,
      freeRemaining,
      reason: 'allowed',
    }
  }

  return {
    canGenerate: false,
    isPaidUnlimited: false,
    isAdminUnlimited: false,
    freeLimit: FREE_PALETTE_GENERATION_LIMIT,
    freeUsed,
    freeRemaining,
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
      statusMessage: `Free users can only generate ${FREE_PALETTE_GENERATION_LIMIT} palettes`,
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
