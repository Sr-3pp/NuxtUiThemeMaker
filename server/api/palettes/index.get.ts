import { requireAuthSession } from '~~/server/utils/auth-session'
import { getPaletteCollection, toStoredPalette } from '~~/server/models/palette'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuthSession(event)
  const collection = await getPaletteCollection()
  const palettes = await collection
    .find({ userId: user.id })
    .sort({ updatedAt: -1 })
    .toArray()

  return palettes.map(toStoredPalette)
})
