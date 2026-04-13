import type { PaletteDefinition, PaletteUiConfig } from '../types/palette'
import { normalizeComponentThemes } from './palette-io'

function cloneUiConfig(ui?: PaletteUiConfig | null) {
  if (!ui) {
    return {}
  }

  return JSON.parse(JSON.stringify(ui)) as PaletteUiConfig
}

export function attachPaletteRuntimeUi<T extends PaletteDefinition>(palette: T, ui?: PaletteUiConfig | null): T {
  return {
    ...palette,
    ui: cloneUiConfig(ui ?? palette.ui),
  }
}

export function resolvePaletteRuntimeUi(palette?: PaletteDefinition | null): PaletteUiConfig {
  if (!palette) {
    return {}
  }
  
  // Normalize component values from {class: "..."} to flat strings for Nuxt UI
  const normalizedComponents = normalizeComponentThemes(palette.components)
  
  // Merge both ui config and component overrides
  // Components should override any conflicting keys from ui
  return {
    ...cloneUiConfig(palette.ui),
    ...normalizedComponents,
  }
}
