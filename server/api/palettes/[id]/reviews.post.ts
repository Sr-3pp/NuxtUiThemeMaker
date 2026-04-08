import { createError, defineEventHandler, getRouterParam, readValidatedBody } from 'h3'
import { paletteReviewWriteSchema } from '~~/server/domain/palette-review-schema'
import { createPaletteReviewForUser } from '~~/server/services/palette-review-service'
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

  const body = await readValidatedBody(event, paletteReviewWriteSchema.parse)

  return createPaletteReviewForUser(id, user, body)
})
