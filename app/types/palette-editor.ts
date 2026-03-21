import type { PaletteDefinition, PaletteModeKey, PaletteTokenValue } from '~/types/palette'
import type { StoredPalette } from '~/types/palette-store'

export type EditablePalette = PaletteDefinition & Partial<Omit<StoredPalette, 'name' | 'palette'>>

export interface UpdateEditablePaletteTokenPayload {
  mode: PaletteModeKey
  section: string
  token: string
  value: PaletteTokenValue
}
