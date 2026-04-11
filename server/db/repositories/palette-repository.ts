import type { ObjectId } from 'mongodb'
import type { PaletteDocument } from '~~/server/types/palette-document'
import { getPaletteCollection } from '~~/server/db/collections/palettes'

export async function listPalettesByUserId(userId: string) {
  const collection = await getPaletteCollection()

  return collection
    .find({
      $or: [
        { userId },
        { 'collaborators.userId': userId },
      ],
    })
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
