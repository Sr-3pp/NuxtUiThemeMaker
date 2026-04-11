import { createError, defineEventHandler, getRouterParam } from 'h3'
import { listPaletteReviewsForViewer } from '~~/server/services/palette-review-service'
import { getOptionalAuthSession } from '~~/server/utils/auth-session'

export default defineEventHandler(async (event) => {
  const session = await getOptionalAuthSession(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Palette id is required',
    })
  }

  return listPaletteReviewsForViewer(id, session?.user.id ?? null)
})
