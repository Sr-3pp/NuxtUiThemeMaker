import { createError, defineEventHandler, getRouterParam } from 'h3'
import { getPaletteQaReportForUser } from '~~/server/services/palette-qa-service'
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

  return getPaletteQaReportForUser(id, user.id)
})
