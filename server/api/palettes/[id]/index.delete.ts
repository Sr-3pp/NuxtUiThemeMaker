import { createError, defineEventHandler, getRouterParam } from 'h3'
import { requireAuthSession } from '~~/server/utils/auth-session'
import { deletePaletteForUser } from '~~/server/services/palette-service'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuthSession(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Palette id is required',
    })
  }

  await deletePaletteForUser(id, user.id)

  return { success: true }
})
