export type PaletteTokenValue = string | null

export type PaletteTokenGroup = Record<string, PaletteTokenValue>

export type PaletteMode = Record<string, PaletteTokenGroup>

export interface PaletteDefinition {
  name: string
  modes: {
    light: PaletteMode
    dark: PaletteMode
  }
}

export type PaletteModeKey = keyof PaletteDefinition['modes']

interface DefaultPaletteOption {
  id: 'default'
  name: string
  type: 'default'
}

interface PresetPaletteOption {
  id: string
  name: string
  type: 'preset'
  palette: PaletteDefinition
}

export type PaletteOption = DefaultPaletteOption | PresetPaletteOption
