import { defineEventHandler } from 'h3'
import { toPaletteVersionSnapshot } from '~~/server/domain/palette'
import { listPaletteHistoryForUser } from '~~/server/services/palette-service'
import { requireAuthSession } from '~~/server/utils/auth-session'
import { requireRouterParam } from '~~/server/utils/route-params'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuthSession(event)
  const id = requireRouterParam(event, 'id', 'palette id')

  const history = await listPaletteHistoryForUser(id, user.id)

  return history.map(toPaletteVersionSnapshot)
})
