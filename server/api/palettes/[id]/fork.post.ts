import { createError, defineEventHandler, getRouterParam } from 'h3'
import { forkPaletteForUser } from '~~/server/services/palette-service'
import { requireAuthSession } from '~~/server/utils/auth-session'

export default defineEventHandler(async (event) => {
  const session = await requireAuthSession(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Palette id is required',
    })
  }

  return forkPaletteForUser(id, {
    id: session.user.id,
    plan: session.user.plan,
    isAdmin: session.user.isAdmin,
  })
})
