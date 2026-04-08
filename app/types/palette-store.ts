import type { PaletteDefinition } from '~/types/palette'
import type { PaletteLifecycleStatus } from '~/types/palette-version'

export interface PaletteForkSource {
  paletteId: string
  userId: string
  slug: string
  name: string
  version: number
}

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
  createdAt: string
  updatedAt: string
}

export interface SavePalettePayload {
  name: string
  palette: PaletteDefinition
  isPublic?: boolean
}

export interface UpdatePalettePayload extends SavePalettePayload {}

export interface UpdatePaletteVisibilityPayload {
  isPublic: boolean
}
