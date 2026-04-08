import { ObjectId } from 'mongodb'
import { getPaletteReviewCollection } from '~~/server/db/collections/palette-reviews'
import type { PaletteReviewDocument } from '~~/server/types/palette-review-document'

export async function createPaletteReview(document: PaletteReviewDocument) {
  const collection = await getPaletteReviewCollection()
  const result = await collection.insertOne(document)

  return collection.findOne({ _id: result.insertedId })
}

export async function listPaletteReviewsByPaletteId(paletteId: ObjectId) {
  const collection = await getPaletteReviewCollection()

  return collection
    .find({ paletteId })
    .sort({ createdAt: -1 })
    .toArray()
}
