import { defineEventHandler } from 'h3'
import { requireAuthSession } from '~~/server/utils/auth-session'
import { deletePaletteForUser } from '~~/server/services/palette-service'
import { requireRouterParam } from '~~/server/utils/route-params'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuthSession(event)
  const id = requireRouterParam(event, 'id', 'palette id')

  await deletePaletteForUser(id, user.id)

  return { success: true }
})
