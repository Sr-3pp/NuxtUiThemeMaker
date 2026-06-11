import { defineEventHandler } from 'h3'
import { getPaletteQaReportForUser } from '~~/server/services/palette-qa-service'
import { requireAuthSession } from '~~/server/utils/auth-session'
import { requireRouterParam } from '~~/server/utils/route-params'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuthSession(event)
  const id = requireRouterParam(event, 'id', 'palette id')

  return getPaletteQaReportForUser(id, user.id)
})
