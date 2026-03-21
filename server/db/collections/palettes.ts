import { type Collection, ObjectId } from 'mongodb'
import type { PaletteDocument } from '~~/server/types/palette-document'
import { getMongoDb } from '~~/server/utils/mongodb'

export async function getPaletteCollection(): Promise<Collection<PaletteDocument>> {
  const db = await getMongoDb()

  return db.collection<PaletteDocument>('palettes')
}

export async function ensurePaletteIndexes() {
  const collection = await getPaletteCollection()

  await Promise.all([
    collection.createIndex({ slug: 1 }, { unique: true }),
    collection.createIndex({ userId: 1, updatedAt: -1 }),
  ])
}
