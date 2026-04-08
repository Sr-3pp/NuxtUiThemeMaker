import type { ObjectId } from 'mongodb'
import type { PaletteReviewStatus } from '~/types/palette-review'

export interface PaletteReviewDocument {
  _id?: ObjectId
  paletteId: ObjectId
  userId: string
  userName: string
  status: PaletteReviewStatus
  message: string
  createdAt: Date
}
