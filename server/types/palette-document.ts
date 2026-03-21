import type { ObjectId } from 'mongodb'
import type { PaletteDefinition } from '~/types/palette'

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
