import { createError, defineEventHandler, getRouterParam } from 'h3'
import { unsharePaletteWithUser } from '~~/server/services/palette-service'
import { requireAuthSession } from '~~/server/utils/auth-session'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuthSession(event)
  const id = getRouterParam(event, 'id')
  const collaboratorUserId = getRouterParam(event, 'collaboratorUserId')

  if (!id || !collaboratorUserId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Palette id and collaborator id are required',
    })
  }

  return unsharePaletteWithUser(id, user.id, collaboratorUserId)
})
