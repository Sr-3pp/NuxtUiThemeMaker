import type { PaletteDefinition, PaletteModeKey } from '../types/palette'
import themeBuilder from './theme-builder'

export function buildPaletteRuntimeTheme(palette: PaletteDefinition, mode: PaletteModeKey) {
  return themeBuilder(palette.modes[mode])
}
