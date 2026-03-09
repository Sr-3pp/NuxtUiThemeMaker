export type PaletteTokenGroup = Record<string, string>

export type PaletteMode = Record<string, PaletteTokenGroup>

export interface PaletteDefinition {
  name: string
  modes: {
    light: PaletteMode
    dark: PaletteMode
  }
}

export type PaletteModeKey = keyof PaletteDefinition['modes']
