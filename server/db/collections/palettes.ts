import { type Collection, ObjectId } from 'mongodb'
import type { PaletteDefinition } from '~/types/palette'
import { getMongoDb } from '~~/server/utils/mongodb'

export interface PaletteDocument {
  _id?: ObjectId
  userId: string
  slug: string
  name: string
  palette: PaletteDefinition
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

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
