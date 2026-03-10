import { readValidatedBody } from 'h3'
import { paletteWriteSchema } from '~~/server/utils/palette-schema'
import { requireAuthSession } from '~~/server/utils/auth-session'
import {
  generateUniquePaletteSlug,
  getPaletteCollection,
  normalizePaletteForStorage,
  toStoredPalette,
} from '../../models/palette'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuthSession(event)
  const body = await readValidatedBody(event, paletteWriteSchema.parse)
  const collection = await getPaletteCollection()
  const name = body.name.trim()
  const now = new Date()
  const slug = await generateUniquePaletteSlug(name)
  const palette = normalizePaletteForStorage(name, body.palette)

  const result = await collection.insertOne({
    userId: user.id,
    slug,
    name,
    palette,
    isPublic: body.isPublic ?? false,
    createdAt: now,
    updatedAt: now,
  })

  const document = await collection.findOne({ _id: result.insertedId })

  if (!document) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create palette',
    })
  }

  return toStoredPalette(document)
})
