import { ensurePaletteIndexes } from '~~/server/db/collections/palettes'
import { ensurePaletteReviewIndexes } from '~~/server/db/collections/palette-reviews'
import { ensurePaletteVersionIndexes } from '~~/server/db/collections/palette-versions'

export default defineNitroPlugin(async () => {
  await Promise.all([
    ensurePaletteIndexes(),
    ensurePaletteReviewIndexes(),
    ensurePaletteVersionIndexes(),
  ])
})
