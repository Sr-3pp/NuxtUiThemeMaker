import type { PaletteDefinition } from '~/types/palette'

export interface StoredPalette {
  _id: string
  userId: string
  slug: string
  name: string
  palette: PaletteDefinition
  isPublic: boolean
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
