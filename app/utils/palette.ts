import { toRaw } from 'vue'
import type { PaletteDefinition } from '~/types/palette'

export function clonePalette(palette: PaletteDefinition): PaletteDefinition {
  return JSON.parse(JSON.stringify(toRaw(palette))) as PaletteDefinition
}
