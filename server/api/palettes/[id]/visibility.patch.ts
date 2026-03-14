import {
  createError,
  defineEventHandler,
  getRouterParam,
  readValidatedBody,
} from 'h3'
import { toStoredPalette } from '~~/server/domain/palette'
import { paletteVisibilitySchema } from '~~/server/domain/palette-schema'
import {
  findPaletteById,
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

  const body = await readValidatedBody(event, paletteVisibilitySchema.parse)
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

  const updated = await updatePaletteById(existing._id, {
    isPublic: body.isPublic,
    updatedAt: new Date(),
  })

  if (!updated) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update visibility',
    })
  }

  return toStoredPalette(updated)
})
