import { createError, defineEventHandler, getRouterParam } from 'h3'
import { toPaletteVersionSnapshot } from '~~/server/domain/palette'
import { listPaletteHistoryForUser } from '~~/server/services/palette-service'
import { requireAuthSession } from '~~/server/utils/auth-session'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuthSession(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Palette id is required',
    })
  }

  const history = await listPaletteHistoryForUser(id, user.id)

  return history.map(toPaletteVersionSnapshot)
})
