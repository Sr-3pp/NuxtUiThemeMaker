import { defineEventHandler, readValidatedBody } from 'h3'
import { paletteWriteSchema } from '~~/server/domain/palette-schema'
import { createPaletteForUser } from '~~/server/services/palette-service'
import { requireAuthSession } from '~~/server/utils/auth-session'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuthSession(event)
  const body = await readValidatedBody(event, paletteWriteSchema.parse)

  return createPaletteForUser(user, body)
})
