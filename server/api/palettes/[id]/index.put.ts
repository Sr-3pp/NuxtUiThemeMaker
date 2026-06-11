import { defineEventHandler, readValidatedBody } from 'h3'
import { paletteWriteSchema } from '~~/server/domain/palette-schema'
import { updatePaletteForUser } from '~~/server/services/palette-service'
import { requireAuthSession } from '~~/server/utils/auth-session'
import { requireRouterParam } from '~~/server/utils/route-params'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuthSession(event)
  const id = requireRouterParam(event, 'id', 'palette id')

  const body = await readValidatedBody(event, paletteWriteSchema.parse)

  return updatePaletteForUser(id, user.id, body)
})
