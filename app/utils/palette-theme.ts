import type {
  PaletteColorScales,
  PaletteDefinition,
  PaletteMode,
  PaletteModeKey,
} from '../types/palette'
import { paletteScaleSteps } from '../types/palette'
import type { ThemeSchema } from '../types/theme-builder'
import { normalizePaletteDefinition } from './palette-domain'
import { resolveNuxtUiComponentThemes } from './nuxt-ui-component-variants'

const semanticColorKeys = new Set(['primary', 'secondary', 'neutral', 'success', 'info', 'warning', 'error'])
const knownUiKeys = new Set(['border', 'border-muted', 'border-accented', 'ring'])

export interface PaletteThemeTokenTarget {
  section: string
  key: string
}

export interface PaletteThemeData {
  palette: PaletteDefinition
  cssVars: {
    light: Record<string, string>
    dark: Record<string, string>
  }
  ui: Record<string, unknown>
  components: NonNullable<PaletteDefinition['components']>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isComponentThemeSectionLike(value: unknown) {
  if (!isRecord(value)) {
    return false
  }

  return ['base', 'slots', 'variants', 'states'].some(key => key in value)
}

export function splitPaletteUiConfigEntries(uiConfig: Record<string, unknown> | undefined) {
  const ui: Record<string, unknown> = {}
  const components: NonNullable<PaletteDefinition['components']> = {}

  Object.entries(uiConfig ?? {}).forEach(([key, value]) => {
    if (isComponentThemeSectionLike(value)) {
      components[key] = value as NonNullable<PaletteDefinition['components']>[string]
      return
    }

    ui[key] = value
  })

  return {
    ui,
    components,
  }
}

export function buildPaletteThemeTokenName(section: string, key: string) {
  if (section === 'ui' || section === 'color') {
    return `--ui-${key}`
  }

  if (key === 'default') {
    return `--ui-${section}`
  }

  return `--ui-${section}-${key}`
}

export function parsePaletteThemeTokenName(tokenName: string): PaletteThemeTokenTarget | null {
  const normalized = tokenName.trim()

  if (!normalized.startsWith('--ui-')) {
    return null
  }

  const rawKey = normalized.slice(5)

  if (!rawKey) {
    return null
  }

  if (semanticColorKeys.has(rawKey)) {
    return {
      section: 'color',
      key: rawKey,
    }
  }

  if (knownUiKeys.has(rawKey)) {
    return {
      section: 'ui',
      key: rawKey,
    }
  }

  const segments = rawKey.split('-')
  const section = segments[0]

  if (!section) {
    return null
  }

  if (segments.length === 1) {
    return {
      section,
      key: 'default',
    }
  }

  return {
    section,
    key: segments.slice(1).join('-'),
  }
}

export function buildPaletteModeTheme(mode: ThemeSchema) {
  const theme: Record<string, string> = {}

  Object.entries(mode).forEach(([section, value]) => {
    if (value && typeof value === 'object') {
      Object.entries(value).forEach(([key, nestedValue]) => {
        if (nestedValue != null) {
          theme[buildPaletteThemeTokenName(section, key)] = nestedValue
        }
      })
      return
    }

    if (value != null) {
      theme[section.includes('--ui') ? section : `--ui-${section}`] = value
    }
  })

  return theme
}

export function parsePaletteThemeTokens(themeTokens: Record<string, string> | undefined): PaletteMode {
  const mode: PaletteMode = {}

  if (!themeTokens) {
    return mode
  }

  Object.entries(themeTokens).forEach(([tokenName, tokenValue]) => {
    const target = parsePaletteThemeTokenName(tokenName)

    if (!target) {
      return
    }

    const sectionTokens = mode[target.section] ??= {}
    sectionTokens[target.key] = tokenValue
  })

  return mode
}

export function buildPaletteRampTheme(colors?: PaletteColorScales) {
  if (!colors) {
    return {}
  }

  return Object.entries(colors).reduce<Record<string, string>>((tokens, [colorKey, scale]) => {
    for (const step of paletteScaleSteps) {
      const value = scale[step]

      if (value != null) {
        tokens[`--ui-color-${colorKey}-${step}`] = value
      }
    }

    return tokens
  }, {})
}

export function buildPaletteRuntimeTheme(palette: PaletteDefinition, mode: PaletteModeKey) {
  return buildPaletteModeTheme(palette.modes[mode])
}

export function buildPaletteThemeData(palette: PaletteDefinition): PaletteThemeData {
  const normalizedPalette = normalizePaletteDefinition(palette)
  const allUiConfig = {
    ...(normalizedPalette.ui ?? {}),
    ...(normalizedPalette.components ?? {}),
  }
  const { ui, components: rawComponents } = splitPaletteUiConfigEntries(allUiConfig)
  const components = resolveNuxtUiComponentThemes(rawComponents)
  const cssVars = {
    light: {
      ...buildPaletteModeTheme(normalizedPalette.modes.light),
      ...buildPaletteRampTheme(normalizedPalette.colors),
    },
    dark: buildPaletteModeTheme(normalizedPalette.modes.dark),
  }

  return {
    palette: normalizedPalette,
    cssVars,
    ui,
    components,
  }
}

export function buildNuxtUiConfig(data: PaletteThemeData): Record<string, unknown> {
  return {
    theme: data.cssVars,
    ...data.ui,
    ...data.components,
  }
}
