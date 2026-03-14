import { ensurePaletteIndexes } from '~~/server/db/collections/palettes'

export default defineNitroPlugin(async () => {
  await ensurePaletteIndexes()
})
