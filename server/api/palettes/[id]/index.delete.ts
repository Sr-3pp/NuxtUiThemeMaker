import { requireAuthSession } from '~~/server/utils/auth-session'
import {
  deletePaletteById,
  findPaletteById,
  parsePaletteObjectId,
} from '~~/server/db/repositories/palette-repository'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuthSession(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Palette id is required',
    })
  }

  const objectId = parsePaletteObjectId(id)
  const existing = await findPaletteById(objectId)

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Palette not found',
    })
  }

  if (existing.userId !== user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
    })
  }

  await deletePaletteById(existing._id)

  return { success: true }
})
