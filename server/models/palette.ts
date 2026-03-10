import { randomUUID } from 'node:crypto'
import { ObjectId, type Collection } from 'mongodb'
import type { PaletteDefinition } from '~/types/palette'
import type { StoredPalette } from '~/types/palette-store'
import { getMongoDb } from '../utils/mongodb'

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

export function toStoredPalette(document: PaletteDocument): StoredPalette {
  if (!document._id) {
    throw new Error('Palette document is missing _id')
  }

  return {
    _id: document._id.toHexString(),
    userId: document.userId,
    slug: document.slug,
    name: document.name,
    palette: document.palette,
    isPublic: document.isPublic,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  }
}

export function normalizePaletteForStorage(name: string, palette: PaletteDefinition): PaletteDefinition {
  return {
    ...palette,
    name,
  }
}

export function createSlugBase(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return slug || 'palette'
}

export async function generateUniquePaletteSlug(name: string, currentId?: ObjectId) {
  const collection = await getPaletteCollection()
  const baseSlug = createSlugBase(name)
  let slug = baseSlug
  let attempt = 0

  while (true) {
    const existing = await collection.findOne(
      { slug },
      { projection: { _id: 1 } }
    )

    if (!existing || (currentId && existing._id.equals(currentId))) {
      return slug
    }

    attempt += 1
    slug = `${baseSlug}-${randomUUID().slice(0, Math.min(4 + attempt, 8))}`
  }
}

export function parsePaletteObjectId(id: string) {
  if (!ObjectId.isValid(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid palette id',
    })
  }

  return new ObjectId(id)
}
