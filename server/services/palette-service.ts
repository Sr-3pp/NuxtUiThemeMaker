import { createError } from 'h3'
import { getPaletteSaveLimit } from '../../app/data/pricing'
import type { PaletteDefinition } from '~/types/palette'
import type { StoredPalette } from '~/types/palette-store'
import type { PaletteVersionEvent } from '~/types/palette-version'
import type { PaletteUser } from '~~/server/types/palette-service'
import {
  countPalettesByUserId,
  createPalette,
  deletePaletteById,
  findPaletteById,
  updatePaletteById,
} from '~~/server/db/repositories/palette-repository'
import { createPaletteVersion, listPaletteVersionsByPaletteId } from '~~/server/db/repositories/palette-version-repository'
import { getPaletteLifecycleStatus, normalizePaletteForStorage, toStoredPalette } from '~~/server/domain/palette'
import { generateUniquePaletteSlug, parsePaletteObjectId } from '~~/server/services/palette-helpers'
import { assertPalettePublishReady } from '~~/server/services/palette-qa-service'

function getPaletteLimitMessage(plan: string | undefined, saveLimit: number) {
  const planName = plan === 'pro' ? 'Pro' : 'Free plan'
  const paletteLabel = saveLimit === 1 ? 'palette' : 'palettes'

  return `${planName} users can only save ${saveLimit} ${paletteLabel}`
}

async function createPaletteVersionSnapshot(
  paletteId: import('mongodb').ObjectId,
  input: {
    userId: string
    version: number
    name: string
    palette: PaletteDefinition
    lifecycleStatus: 'draft' | 'published'
    isPublic: boolean
    event: PaletteVersionEvent
  }
) {
  await createPaletteVersion({
    paletteId,
    userId: input.userId,
    version: input.version,
    name: input.name,
    palette: input.palette,
    lifecycleStatus: input.lifecycleStatus,
    isPublic: input.isPublic,
    event: input.event,
    createdAt: new Date(),
  })
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
  const isPublic = input.isPublic ?? false
  const lifecycleStatus = getPaletteLifecycleStatus(isPublic)

  if (isPublic) {
    assertPalettePublishReady(palette)
  }

  const document = await createPalette({
    userId: user.id,
    slug,
    name,
    palette,
    isPublic,
    lifecycleStatus,
    version: 1,
    publishedAt: lifecycleStatus === 'published' ? now : null,
    createdAt: now,
    updatedAt: now,
  })

  if (!document) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create palette',
    })
  }

  await createPaletteVersionSnapshot(document._id, {
    userId: user.id,
    version: 1,
    name,
    palette,
    lifecycleStatus,
    isPublic,
    event: lifecycleStatus === 'published' ? 'published' : 'created',
  })

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
  const isPublic = input.isPublic ?? existing.isPublic
  const lifecycleStatus = getPaletteLifecycleStatus(isPublic)
  const version = (existing.version ?? 1) + 1
  const publishedAt = lifecycleStatus === 'published'
    ? existing.publishedAt ?? new Date()
    : null

  if (isPublic) {
    assertPalettePublishReady(palette)
  }

  const updated = await updatePaletteById(existing._id, {
    slug,
    name,
    palette,
    isPublic,
    lifecycleStatus,
    version,
    publishedAt,
    updatedAt: new Date(),
  })

  if (!updated) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update palette',
    })
  }

  await createPaletteVersionSnapshot(existing._id, {
    userId,
    version,
    name,
    palette,
    lifecycleStatus,
    isPublic,
    event: existing.isPublic === isPublic
      ? 'updated'
      : isPublic
        ? 'published'
        : 'unpublished',
  })

  return toStoredPalette(updated)
}

export async function setPaletteVisibilityForUser(
  id: string,
  userId: string,
  isPublic: boolean
): Promise<StoredPalette> {
  const existing = await getOwnedPaletteByIdOrThrow(id, userId)
  const lifecycleStatus = getPaletteLifecycleStatus(isPublic)
  const version = (existing.version ?? 1) + 1
  const publishedAt = lifecycleStatus === 'published'
    ? existing.publishedAt ?? new Date()
    : null

  if (isPublic) {
    assertPalettePublishReady(existing.palette)
  }

  const updated = await updatePaletteById(existing._id, {
    isPublic,
    lifecycleStatus,
    version,
    publishedAt,
    updatedAt: new Date(),
  })

  if (!updated) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update visibility',
    })
  }

  await createPaletteVersionSnapshot(existing._id, {
    userId,
    version,
    name: existing.name,
    palette: existing.palette,
    lifecycleStatus,
    isPublic,
    event: isPublic ? 'published' : 'unpublished',
  })

  return toStoredPalette(updated)
}

export async function deletePaletteForUser(id: string, userId: string) {
  const existing = await getOwnedPaletteByIdOrThrow(id, userId)

  await deletePaletteById(existing._id)
}

export async function listPaletteHistoryForUser(id: string, userId: string) {
  const existing = await getOwnedPaletteByIdOrThrow(id, userId)

  return listPaletteVersionsByPaletteId(existing._id)
}
