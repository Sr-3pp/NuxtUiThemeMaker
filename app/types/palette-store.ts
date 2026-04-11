import type { PaletteDefinition } from '~/types/palette'
import type { PaletteLifecycleStatus } from '~/types/palette-version'

export interface PaletteForkSource {
  paletteId: string
  userId: string
  slug: string
  name: string
  version: number
}

export interface PaletteCollaborator {
  userId: string
  email: string
  name: string
}

export type PaletteAccessLevel = 'owner' | 'shared'

export interface StoredPalette {
  _id: string
  userId: string
  slug: string
  name: string
  palette: PaletteDefinition
  isPublic: boolean
  lifecycleStatus: PaletteLifecycleStatus
  version: number
  publishedAt: string | null
  forkedFrom: PaletteForkSource | null
  collaborators: PaletteCollaborator[]
  accessLevel: PaletteAccessLevel
  createdAt: string
  updatedAt: string
}

export interface SavePalettePayload {
  name: string
  palette: PaletteDefinition
  isPublic?: boolean
}

export type UpdatePalettePayload = SavePalettePayload

export interface UpdatePaletteVisibilityPayload {
  isPublic: boolean
}

export interface SharePalettePayload {
  email: string
}
