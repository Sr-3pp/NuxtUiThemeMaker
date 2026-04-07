import type { PaletteDefinition, PaletteModeKey, PaletteTokenValue } from '~/types/palette'
import type { StoredPalette } from '~/types/palette-store'

export type EditablePalette = PaletteDefinition & Partial<Omit<StoredPalette, 'name' | 'palette'>>

export interface UpdateEditablePaletteTokenPayload {
  mode: PaletteModeKey
  section: string
  token: string
  value: PaletteTokenValue
}

export interface UpdateEditablePaletteColorScalePayload {
  colorKey: string
  step: string
  value: PaletteTokenValue
  syncMode?: PaletteModeKey | 'both'
}

export interface UpdateEditablePaletteComponentTokenPayload {
  component: string
  area: 'base' | 'slot' | 'variant' | 'state'
  token: string
  value: PaletteTokenValue
  slot?: string
  variant?: string
  variantColor?: string
  state?: string
}
