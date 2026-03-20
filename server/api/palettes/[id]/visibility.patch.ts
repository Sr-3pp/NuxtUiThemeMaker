import {
  createError,
  defineEventHandler,
  getRouterParam,
  readValidatedBody,
} from 'h3'
import { paletteVisibilitySchema } from '~~/server/domain/palette-schema'
import { setPaletteVisibilityForUser } from '~~/server/services/palette-service'
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

  const body = await readValidatedBody(event, paletteVisibilitySchema.parse)

  return setPaletteVisibilityForUser(id, user.id, body.isPublic)
})
