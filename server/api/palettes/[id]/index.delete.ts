import { requireAuthSession } from '~~/server/utils/auth-session'
import { getPaletteCollection, parsePaletteObjectId } from '~~/server/models/palette'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuthSession(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Palette id is required',
    })
  }

  const collection = await getPaletteCollection()
  const objectId = parsePaletteObjectId(id)
  const existing = await collection.findOne({ _id: objectId })

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

  await collection.deleteOne({ _id: existing._id })

  return { success: true }
})
