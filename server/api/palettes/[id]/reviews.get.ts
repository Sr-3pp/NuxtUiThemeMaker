import { defineEventHandler } from 'h3'
import { listPaletteReviewsForViewer } from '~~/server/services/palette-review-service'
import { getOptionalAuthSession } from '~~/server/utils/auth-session'
import { requireRouterParam } from '~~/server/utils/route-params'

export default defineEventHandler(async (event) => {
  const session = await getOptionalAuthSession(event)
  const id = requireRouterParam(event, 'id', 'palette id')

  return listPaletteReviewsForViewer(id, session?.user.id ?? null)
})
