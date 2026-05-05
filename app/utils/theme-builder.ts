import { buildPaletteModeTheme } from './palette-theme'
import type { ThemeSchema } from '~/types/theme-builder'

export default function themeBuilder(colorSchema: ThemeSchema) {
  return buildPaletteModeTheme(colorSchema)
}
