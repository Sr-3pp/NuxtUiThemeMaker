import type { ObjectId } from 'mongodb'
import type { PaletteDefinition } from '~/types/palette'
import type { PaletteLifecycleStatus, PaletteVersionEvent } from '~/types/palette-version'

export interface PaletteVersionDocument {
  _id?: ObjectId
  paletteId: ObjectId
  userId: string
  version: number
  name: string
  palette: PaletteDefinition
  lifecycleStatus: PaletteLifecycleStatus
  isPublic: boolean
  event: PaletteVersionEvent
  createdAt: Date
}
