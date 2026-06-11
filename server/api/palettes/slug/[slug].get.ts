import { createError, defineEventHandler } from 'h3'
import { toStoredPalette } from '~~/server/domain/palette'
import { findPaletteBySlug } from '~~/server/db/repositories/palette-repository'
import { getOptionalAuthSession } from '~~/server/utils/auth-session'
import { requireRouterParam } from '~~/server/utils/route-params'

export default defineEventHandler(async (event) => {
  const session = await getOptionalAuthSession(event)
  const slug = requireRouterParam(event, 'slug', 'palette slug')

  const palette = await findPaletteBySlug(slug)

  if (!palette) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Palette not found',
    })
  }

  const isOwner = session?.user.id === palette.userId
  const isCollaborator = Boolean(session?.user.id && palette.collaborators?.some(collaborator => collaborator.userId === session.user.id))

  if (!palette.isPublic && !isOwner && !isCollaborator) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Palette not found',
    })
  }

  return toStoredPalette(palette, session?.user.id)
})
