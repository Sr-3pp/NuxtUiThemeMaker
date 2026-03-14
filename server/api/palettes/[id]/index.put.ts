import { readValidatedBody } from 'h3'
import { normalizePaletteForStorage, toStoredPalette } from '~~/server/domain/palette'
import { paletteWriteSchema } from '~~/server/domain/palette-schema'
import {
  findPaletteById,
  generateUniquePaletteSlug,
  parsePaletteObjectId,
  updatePaletteById,
} from '~~/server/db/repositories/palette-repository'
import { requireAuthSession } from '~~/server/utils/auth-session'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuthSession(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Palette id is required',
    })
  }

  const body = await readValidatedBody(event, paletteWriteSchema.parse)
  const objectId = parsePaletteObjectId(id)
  const existing = await findPaletteById(objectId)

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Palette not found',
    })
  }

  if (existing.userId !== user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
    })
  }

  const name = body.name.trim()
  const palette = normalizePaletteForStorage(name, body.palette)
  const slug = await generateUniquePaletteSlug(name, existing._id)
  const now = new Date()

  const updated = await updatePaletteById(existing._id, {
    slug,
    name,
    palette,
    isPublic: body.isPublic ?? existing.isPublic,
    updatedAt: now,
  })

  if (!updated) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update palette',
    })
  }

  return toStoredPalette(updated)
})
