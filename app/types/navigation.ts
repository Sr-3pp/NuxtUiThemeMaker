import type { PaletteDefinition } from '~/types/palette'

export interface AppNavigationProps {
  currentEditablePalette: PaletteDefinition
  currentPalette: PaletteDefinition | null
  currentPaletteStatus: string
  currentMode: string
  disableInteractivePreviews: boolean
}

export interface AppNavigationEmits {
  resetCurrentPalette: []
  openPaletteImport: []
  openTokensEditor: []
  openExport: []
  toggleInteractivePreviews: [value: boolean]
}
