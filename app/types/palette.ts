export type PaletteTokenValue = string | null

export type PaletteTokenGroup = Record<string, PaletteTokenValue>

export const paletteScaleSteps = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] as const

export type PaletteScaleStep = (typeof paletteScaleSteps)[number]
export type PaletteColorScale = Record<PaletteScaleStep, PaletteTokenValue>
export type PaletteColorScales = Record<string, PaletteColorScale>
export type PaletteAliases = Record<string, string | null>

export interface PaletteComponentThemeSection {
  base?: PaletteTokenGroup
  slots?: Record<string, PaletteTokenGroup>
  variants?: Record<string, Record<string, PaletteTokenGroup>>
  states?: Record<string, PaletteTokenGroup>
}

export type PaletteComponentThemes = Record<string, PaletteComponentThemeSection>

export interface PaletteMetadata {
  version: number
  normalizedAt?: string | null
}

export type PaletteMode = Record<string, PaletteTokenGroup>

export interface PaletteDefinition {
  name: string
  modes: {
    light: PaletteMode
    dark: PaletteMode
  }
  colors?: PaletteColorScales
  aliases?: PaletteAliases
  components?: PaletteComponentThemes
  metadata?: PaletteMetadata
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
