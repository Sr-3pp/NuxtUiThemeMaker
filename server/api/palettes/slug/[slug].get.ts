import { createError, defineEventHandler, getRouterParam } from 'h3'
import { getOptionalAuthSession } from '~~/server/utils/auth-session'
import { getPaletteCollection, toStoredPalette } from '~~/server/models/palette'

export default defineEventHandler(async (event) => {
  const session = await getOptionalAuthSession(event)
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Palette slug is required',
    })
  }

  const collection = await getPaletteCollection()
  const palette = await collection.findOne({ slug })

  if (!palette) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Palette not found',
    })
  }

  const isOwner = session?.user.id === palette.userId

  if (!palette.isPublic && !isOwner) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Palette not found',
    })
  }

  return toStoredPalette(palette)
})
