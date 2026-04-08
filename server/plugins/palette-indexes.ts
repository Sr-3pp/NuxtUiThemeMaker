import { ensurePaletteIndexes } from '~~/server/db/collections/palettes'
import { ensurePaletteVersionIndexes } from '~~/server/db/collections/palette-versions'

export default defineNitroPlugin(async () => {
  await Promise.all([
    ensurePaletteIndexes(),
    ensurePaletteVersionIndexes(),
  ])
})
