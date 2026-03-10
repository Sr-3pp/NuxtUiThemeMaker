import { readValidatedBody } from 'h3'
import { paletteWriteSchema } from '~~/server/utils/palette-schema'
import { requireAuthSession } from '~~/server/utils/auth-session'
import {
  generateUniquePaletteSlug,
  getPaletteCollection,
  normalizePaletteForStorage,
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

  const body = await readValidatedBody(event, paletteWriteSchema.parse)
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

  const name = body.name.trim()
  const palette = normalizePaletteForStorage(name, body.palette)
  const slug = await generateUniquePaletteSlug(name, existing._id)
  const now = new Date()

  await collection.updateOne(
    { _id: existing._id },
    {
      $set: {
        slug,
        name,
        palette,
        isPublic: body.isPublic ?? existing.isPublic,
        updatedAt: now,
      },
    }
  )

  const updated = await collection.findOne({ _id: existing._id })

  if (!updated) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update palette',
    })
  }

  return toStoredPalette(updated)
})
