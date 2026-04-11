import { createError } from 'h3'
import type { AdminPaletteUpdateInput } from '~/types/admin-palette'
import {
  deletePaletteById,
  findPaletteById,
  updatePaletteById,
} from '~~/server/db/repositories/palette-repository'
import { getPaletteLifecycleStatus } from '~~/server/domain/palette'
import { generateUniquePaletteSlug, parsePaletteObjectId } from '~~/server/services/palette-helpers'

export async function updateAdminManagedPalette(
  paletteId: string,
  input: AdminPaletteUpdateInput,
) {
  const objectId = parsePaletteObjectId(paletteId)
  const existingPalette = await findPaletteById(objectId)

  if (!existingPalette) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Palette not found',
    })
  }

  const nextName = input.name.trim()
  const nextSlug = nextName === existingPalette.name
    ? existingPalette.slug
    : await generateUniquePaletteSlug(nextName, objectId)
  const lifecycleStatus = getPaletteLifecycleStatus(input.isPublic)
  const publishedAt = lifecycleStatus === 'published'
    ? existingPalette.publishedAt ?? new Date()
    : null

  const updatedPalette = await updatePaletteById(objectId, {
    name: nextName,
    slug: nextSlug,
    isPublic: input.isPublic,
    lifecycleStatus,
    publishedAt,
    updatedAt: new Date(),
  })

  if (!updatedPalette) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update palette',
    })
  }

  return updatedPalette
}

export async function deleteAdminManagedPalette(paletteId: string) {
  const objectId = parsePaletteObjectId(paletteId)
  const existingPalette = await findPaletteById(objectId)

  if (!existingPalette) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Palette not found',
    })
  }

  await deletePaletteById(objectId)
}
