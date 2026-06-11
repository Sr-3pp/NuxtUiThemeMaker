import { defineEventHandler } from 'h3'
import { forkPaletteForUser } from '~~/server/services/palette-service'
import { requireAuthSession } from '~~/server/utils/auth-session'
import { requireRouterParam } from '~~/server/utils/route-params'

export default defineEventHandler(async (event) => {
  const session = await requireAuthSession(event)
  const id = requireRouterParam(event, 'id', 'palette id')

  return forkPaletteForUser(id, {
    id: session.user.id,
    plan: session.user.plan,
    isAdmin: session.user.isAdmin,
  })
})
