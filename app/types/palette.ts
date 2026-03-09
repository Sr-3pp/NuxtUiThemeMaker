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

export type PaletteOptionType = 'default' | 'preset'

export interface DefaultPaletteOption {
  id: 'default'
  name: 'Nuxt UI Default'
  type: 'default'
}

export interface PresetPaletteOption {
  id: string
  name: string
  type: 'preset'
  palette: PaletteDefinition
}

export type PaletteOption = DefaultPaletteOption | PresetPaletteOption
export type PaletteOptionId = PaletteOption['id']
