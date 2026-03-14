import { toStoredPalette } from '~~/server/domain/palette'
import { listPublicPalettes } from '~~/server/db/repositories/palette-repository'

export default defineEventHandler(async () => {
  const palettes = await listPublicPalettes()

  return palettes.map(toStoredPalette)
})
