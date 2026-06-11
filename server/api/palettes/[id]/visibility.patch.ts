import {
  defineEventHandler,
  readValidatedBody,
} from 'h3'
import { paletteVisibilitySchema } from '~~/server/domain/palette-schema'
import { setPaletteVisibilityForUser } from '~~/server/services/palette-service'
import { requireAuthSession } from '~~/server/utils/auth-session'
import { requireRouterParam } from '~~/server/utils/route-params'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuthSession(event)
  const id = requireRouterParam(event, 'id', 'palette id')

  const body = await readValidatedBody(event, paletteVisibilitySchema.parse)

  return setPaletteVisibilityForUser(id, user.id, body.isPublic)
})
