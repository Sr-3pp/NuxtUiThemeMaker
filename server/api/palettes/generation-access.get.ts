import { defineEventHandler } from 'h3'
import { getPaletteGenerationAccess } from '~~/server/services/palette-generation-access'
import { getOptionalAuthSession } from '~~/server/utils/auth-session'

export default defineEventHandler(async (event) => {
  const session = await getOptionalAuthSession(event)

  return getPaletteGenerationAccess(session)
})
