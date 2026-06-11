import { defineEventHandler, readValidatedBody } from 'h3'
import { paletteReviewWriteSchema } from '~~/server/domain/palette-review-schema'
import { createPaletteReviewForUser } from '~~/server/services/palette-review-service'
import { requireAuthSession } from '~~/server/utils/auth-session'
import { requireRouterParam } from '~~/server/utils/route-params'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuthSession(event)
  const id = requireRouterParam(event, 'id', 'palette id')

  const body = await readValidatedBody(event, paletteReviewWriteSchema.parse)

  return createPaletteReviewForUser(id, user, body)
})
