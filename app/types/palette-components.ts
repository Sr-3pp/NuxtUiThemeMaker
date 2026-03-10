import type { StoredPalette } from '~/types/palette-store'
import type { PaletteDefinition, PaletteModeKey, PaletteOption } from '~/types/palette'

export type ImportTab = 'paste' | 'file'

export interface PaletteImportModalProps {
  open: boolean
}

export interface PaletteImportModalEmits {
  import: [palette: PaletteDefinition]
  'update:open': [value: boolean]
}

export interface PalettePresetSidebarProps {
  activeOwnedPaletteId: string | null
  options: readonly PaletteOption[]
  currentPaletteId: string
  isAuthenticated: boolean
  ownedPalettes: StoredPalette[]
  search: string
}

export interface PalettePresetSidebarEmits {
  select: [id: string]
  selectOwnedPalette: [id: string]
  'update:search': [value: string]
}
