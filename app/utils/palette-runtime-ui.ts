import type { PaletteDefinition, PaletteUiConfig } from '../types/palette'

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
  return cloneUiConfig(palette?.ui)
}
