import { defineEventHandler, readValidatedBody } from 'h3'
import { paletteShareSchema } from '~~/server/domain/palette-sharing-schema'
import { sharePaletteWithUser } from '~~/server/services/palette-service'
import { requireAuthSession } from '~~/server/utils/auth-session'
import { requireRouterParam } from '~~/server/utils/route-params'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuthSession(event)
  const id = requireRouterParam(event, 'id', 'palette id')

  const body = await readValidatedBody(event, paletteShareSchema.parse)

  return sharePaletteWithUser(id, user.id, body.email)
})
