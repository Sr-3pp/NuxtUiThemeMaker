import { createError, defineEventHandler, getRouterParam } from 'h3'
import { toStoredPalette } from '~~/server/domain/palette'
import { findPaletteBySlug } from '~~/server/db/repositories/palette-repository'
import { getOptionalAuthSession } from '~~/server/utils/auth-session'

export default defineEventHandler(async (event) => {
  const session = await getOptionalAuthSession(event)
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Palette slug is required',
    })
  }

  const palette = await findPaletteBySlug(slug)

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
