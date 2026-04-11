import type { ObjectId } from 'mongodb'
import type { PaletteDefinition } from '~/types/palette'
import type { PaletteCollaborator, PaletteForkSource } from '~/types/palette-store'
import type { PaletteLifecycleStatus } from '~/types/palette-version'

export interface PaletteDocument {
  _id?: ObjectId
  userId: string
  slug: string
  name: string
  palette: PaletteDefinition
  isPublic: boolean
  lifecycleStatus: PaletteLifecycleStatus
  version: number
  publishedAt: Date | null
  forkedFrom: PaletteForkSource | null
  collaborators: PaletteCollaborator[]
  createdAt: Date
  updatedAt: Date
}
