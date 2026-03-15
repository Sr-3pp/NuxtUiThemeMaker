import { randomUUID } from 'node:crypto'
import { ObjectId } from 'mongodb'
import { createSlugBase } from '~~/server/domain/palette'
import { getPaletteCollection, type PaletteDocument } from '~~/server/db/collections/palettes'

export async function listPalettesByUserId(userId: string) {
  const collection = await getPaletteCollection()

  return collection
    .find({ userId })
    .sort({ updatedAt: -1 })
    .toArray()
}

export async function countPalettesByUserId(userId: string) {
  const collection = await getPaletteCollection()

  return collection.countDocuments({ userId })
}

export async function listPublicPalettes() {
  const collection = await getPaletteCollection()

  return collection
    .find({ isPublic: true })
    .sort({ updatedAt: -1 })
    .toArray()
}

export async function findPaletteById(id: ObjectId) {
  const collection = await getPaletteCollection()

  return collection.findOne({ _id: id })
}

export async function findPaletteBySlug(slug: string) {
  const collection = await getPaletteCollection()

  return collection.findOne({ slug })
}

export async function createPalette(document: PaletteDocument) {
  const collection = await getPaletteCollection()
  const result = await collection.insertOne(document)

  return collection.findOne({ _id: result.insertedId })
}

export async function updatePaletteById(id: ObjectId, update: Partial<PaletteDocument>) {
  const collection = await getPaletteCollection()

  await collection.updateOne(
    { _id: id },
    {
      $set: update,
    }
  )

  return collection.findOne({ _id: id })
}

export async function deletePaletteById(id: ObjectId) {
  const collection = await getPaletteCollection()

  return collection.deleteOne({ _id: id })
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
