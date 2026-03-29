import { createError } from 'h3'
import { getPaletteSaveLimit } from '../../app/data/pricing'
import type { PaletteDefinition } from '~/types/palette'
import type { StoredPalette } from '~/types/palette-store'
import type { PaletteUser } from '~~/server/types/palette-service'
import {
  countPalettesByUserId,
  createPalette,
  deletePaletteById,
  findPaletteById,
  updatePaletteById,
} from '~~/server/db/repositories/palette-repository'
import { normalizePaletteForStorage, toStoredPalette } from '~~/server/domain/palette'
import { generateUniquePaletteSlug, parsePaletteObjectId } from '~~/server/services/palette-helpers'

function getPaletteLimitMessage(plan: string | undefined, saveLimit: number) {
  const planName = plan === 'pro' ? 'Pro' : 'Free plan'
  const paletteLabel = saveLimit === 1 ? 'palette' : 'palettes'

  return `${planName} users can only save ${saveLimit} ${paletteLabel}`
}

export async function getOwnedPaletteByIdOrThrow(id: string, userId: string) {
  const objectId = parsePaletteObjectId(id)
  const existing = await findPaletteById(objectId)

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Palette not found',
    })
  }

  if (existing.userId !== userId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
    })
  }

  return existing
}

export async function createPaletteForUser(
  user: PaletteUser,
  input: {
    name: string
    palette: PaletteDefinition
    isPublic?: boolean
  }
): Promise<StoredPalette> {
  const name = input.name.trim()
  const saveLimit = user.isAdmin ? null : getPaletteSaveLimit(user.plan)

  if (saveLimit !== null) {
    const paletteCount = await countPalettesByUserId(user.id)

    if (paletteCount >= saveLimit) {
      throw createError({
        statusCode: 403,
        statusMessage: getPaletteLimitMessage(user.plan, saveLimit),
      })
    }
  }

  const now = new Date()
  const slug = await generateUniquePaletteSlug(name)
  const palette = normalizePaletteForStorage(name, input.palette)
  const document = await createPalette({
    userId: user.id,
    slug,
    name,
    palette,
    isPublic: input.isPublic ?? false,
    createdAt: now,
    updatedAt: now,
  })

  if (!document) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create palette',
    })
  }

  return toStoredPalette(document)
}

export async function updatePaletteForUser(
  id: string,
  userId: string,
  input: {
    name: string
    palette: PaletteDefinition
    isPublic?: boolean
  }
): Promise<StoredPalette> {
  const existing = await getOwnedPaletteByIdOrThrow(id, userId)
  const name = input.name.trim()
  const palette = normalizePaletteForStorage(name, input.palette)
  const slug = await generateUniquePaletteSlug(name, existing._id)
  const updated = await updatePaletteById(existing._id, {
    slug,
    name,
    palette,
    isPublic: input.isPublic ?? existing.isPublic,
    updatedAt: new Date(),
  })

  if (!updated) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update palette',
    })
  }

  return toStoredPalette(updated)
}

export async function setPaletteVisibilityForUser(
  id: string,
  userId: string,
  isPublic: boolean
): Promise<StoredPalette> {
  const existing = await getOwnedPaletteByIdOrThrow(id, userId)
  const updated = await updatePaletteById(existing._id, {
    isPublic,
    updatedAt: new Date(),
  })

  if (!updated) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update visibility',
    })
  }

  return toStoredPalette(updated)
}

export async function deletePaletteForUser(id: string, userId: string) {
  const existing = await getOwnedPaletteByIdOrThrow(id, userId)

  await deletePaletteById(existing._id)
}
