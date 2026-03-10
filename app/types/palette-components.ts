import type { PaletteDefinition, PaletteModeKey, PaletteOption, PaletteOptionId } from '~/types/palette'

export type ImportTab = 'paste' | 'file'

export interface PaletteImportModalProps {
  open: boolean
}

export interface PaletteImportModalEmits {
  import: [palette: PaletteDefinition]
  'update:open': [value: boolean]
}

export interface PaletteEditorDrawerProps {
  open: boolean
  palette: PaletteDefinition
  defaultMode?: PaletteModeKey
}

export interface PaletteEditorDrawerEmits {
  save: [palette: PaletteDefinition]
  'update:open': [value: boolean]
}

export interface PalettePresetSidebarProps {
  options: readonly PaletteOption[]
  currentPaletteId: PaletteOptionId
  search: string
}

export interface PalettePresetSidebarEmits {
  select: [id: PaletteOptionId]
  'update:search': [value: string]
}
