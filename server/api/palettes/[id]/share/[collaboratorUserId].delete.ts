import { defineEventHandler } from 'h3'
import { unsharePaletteWithUser } from '~~/server/services/palette-service'
import { requireAuthSession } from '~~/server/utils/auth-session'
import { requireRouterParam } from '~~/server/utils/route-params'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuthSession(event)
  const id = requireRouterParam(event, 'id', 'palette id')
  const collaboratorUserId = requireRouterParam(event, 'collaboratorUserId', 'collaborator id')

  return unsharePaletteWithUser(id, user.id, collaboratorUserId)
})
