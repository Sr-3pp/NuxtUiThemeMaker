import type { Collection } from 'mongodb'
import type { PaletteReviewDocument } from '~~/server/types/palette-review-document'
import { getMongoDb } from '~~/server/utils/mongodb'

export async function getPaletteReviewCollection(): Promise<Collection<PaletteReviewDocument>> {
  const db = await getMongoDb()

  return db.collection<PaletteReviewDocument>('palette_reviews')
}

export async function ensurePaletteReviewIndexes() {
  const collection = await getPaletteReviewCollection()

  await Promise.all([
    collection.createIndex({ paletteId: 1, createdAt: -1 }),
    collection.createIndex({ userId: 1, createdAt: -1 }),
  ])
}
