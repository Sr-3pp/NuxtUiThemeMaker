import type { Collection } from 'mongodb'
import type { PaletteVersionDocument } from '~~/server/types/palette-version-document'
import { getMongoDb } from '~~/server/utils/mongodb'

export async function getPaletteVersionCollection(): Promise<Collection<PaletteVersionDocument>> {
  const db = await getMongoDb()

  return db.collection<PaletteVersionDocument>('palette_versions')
}

export async function ensurePaletteVersionIndexes() {
  const collection = await getPaletteVersionCollection()

  await Promise.all([
    collection.createIndex({ paletteId: 1, version: -1 }, { unique: true }),
    collection.createIndex({ userId: 1, createdAt: -1 }),
  ])
}
