import type { ObjectId } from 'mongodb'
import { getPaletteVersionCollection } from '~~/server/db/collections/palette-versions'
import type { PaletteVersionDocument } from '~~/server/types/palette-version-document'

export async function createPaletteVersion(document: PaletteVersionDocument) {
  const collection = await getPaletteVersionCollection()
  const result = await collection.insertOne(document)

  return collection.findOne({ _id: result.insertedId })
}

export async function listPaletteVersionsByPaletteId(paletteId: ObjectId) {
  const collection = await getPaletteVersionCollection()

  return collection
    .find({ paletteId })
    .sort({ version: -1 })
    .toArray()
}
