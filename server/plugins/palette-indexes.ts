import { getPaletteCollection } from '../models/palette'

export default defineNitroPlugin(async () => {
  const collection = await getPaletteCollection()

  await Promise.all([
    collection.createIndex({ slug: 1 }, { unique: true }),
    collection.createIndex({ userId: 1, updatedAt: -1 }),
  ])
})
