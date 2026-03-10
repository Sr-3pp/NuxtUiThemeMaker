import {
  createError,
  defineEventHandler,
  getRouterParam,
  readValidatedBody,
} from 'h3'
import { paletteVisibilitySchema } from '~~/server/utils/palette-schema'
import { requireAuthSession } from '~~/server/utils/auth-session'
import {
  getPaletteCollection,
  parsePaletteObjectId,
  toStoredPalette,
} from '~~/server/models/palette'

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
  const collection = await getPaletteCollection()
  const objectId = parsePaletteObjectId(id)
  const existing = await collection.findOne({ _id: objectId })

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

  await collection.updateOne(
    { _id: existing._id },
    {
      $set: {
        isPublic: body.isPublic,
        updatedAt: new Date(),
      },
    }
  )

  const updated = await collection.findOne({ _id: existing._id })

  if (!updated) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update visibility',
    })
  }

  return toStoredPalette(updated)
})
