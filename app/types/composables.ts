import type { PaletteDefinition, PaletteModeKey, PaletteOptionId } from '~/types/palette'

export type CurrentThemeMode = PaletteModeKey

export type PaletteDraftMap = Record<PaletteOptionId, PaletteDefinition>
