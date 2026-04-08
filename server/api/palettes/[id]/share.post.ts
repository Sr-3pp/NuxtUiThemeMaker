import { createError, defineEventHandler, getRouterParam, readValidatedBody } from 'h3'
import { paletteShareSchema } from '~~/server/domain/palette-sharing-schema'
import { sharePaletteWithUser } from '~~/server/services/palette-service'
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

  const body = await readValidatedBody(event, paletteShareSchema.parse)

  return sharePaletteWithUser(id, user.id, body.email)
})
