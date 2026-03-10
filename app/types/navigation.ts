import type { PaletteDefinition } from '~/types/palette'

export interface AppNavigationProps {
  currentEditablePalette: PaletteDefinition
  currentPalette: PaletteDefinition | null
  currentPaletteStatus: string
  currentMode: string
  disableInteractivePreviews: boolean
  isAuthenticated: boolean
  sessionEmail?: string | null
  activeOwnedPaletteSlug?: string | null
  activeOwnedPalettePublic?: boolean
  isWorking?: boolean
}

export interface AppNavigationEmits {
  resetCurrentPalette: []
  openPaletteImport: []
  openTokensEditor: []
  openExport: []
  copyShareUrl: []
  deletePalette: []
  persistVisibility: [nextIsPublic: boolean]
  signOut: []
  toggleInteractivePreviews: [value: boolean]
}
