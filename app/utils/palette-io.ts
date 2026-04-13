import type { PaletteDefinition } from '~/types/palette'
import { normalizePaletteDefinition } from './palette-domain'

const semanticColorKeys = new Set(['primary', 'secondary', 'neutral', 'success', 'info', 'warning', 'error'])
const knownUiKeys = new Set(['border', 'border-muted', 'border-accented', 'ring'])

interface ParsedThemeTokenTarget {
  section: string
  key: string
}

interface ExportedThemeModule {
  theme?: {
    light?: Record<string, string>
    dark?: Record<string, string>
  }
  ui?: Record<string, unknown>
  components?: PaletteDefinition['components']
}

interface ParsedAppConfigModule {
  ui?: {
    theme?: {
      light?: Record<string, string>
      dark?: Record<string, string>
    }
    [key: string]: unknown
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isComponentThemeSectionLike(value: unknown) {
  if (!isRecord(value)) {
    return false
  }

  const componentThemeKeys = ['base', 'slots', 'variants', 'states']

  return componentThemeKeys.some(key => key in value)
}

/**
 * Normalize component theme value to Nuxt UI format.
 * Converts {class: "..."} to flat string, keeps token objects like {bg: "...", text: "..."}
 */
function normalizeComponentValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return value
  }

  if (!isRecord(value)) {
    return value
  }

  // If it's an object with only "class" key, extract the class value
  const keys = Object.keys(value)
  if (keys.length === 1 && keys[0] === 'class' && typeof value.class === 'string') {
    return value.class
  }

  // Otherwise recursively normalize nested objects
  const normalized: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(value)) {
    normalized[key] = normalizeComponentValue(val)
  }
  return normalized
}

/**
 * Normalize all component theme sections to Nuxt UI format.
 * Converts {class: "..."} values to flat strings throughout the component tree.
 */
export function normalizeComponentThemes(
  components: Record<string, unknown> | undefined
): NonNullable<PaletteDefinition['components']> {
  if (!components) {
    return {}
  }

  const normalized: Record<string, unknown> = {}
  for (const [componentKey, section] of Object.entries(components)) {
    normalized[componentKey] = normalizeComponentValue(section)
  }
  return normalized as NonNullable<PaletteDefinition['components']>
}

/**
 * Separates component theme sections from other UI config.
 * Component sections have keys like 'base', 'slots', 'variants', or 'states'.
 */
export function splitUiConfigEntries(uiConfig: Record<string, unknown> | undefined) {
  const paletteUi: Record<string, unknown> = {}
  const components: NonNullable<PaletteDefinition['components']> = {}

  Object.entries(uiConfig ?? {}).forEach(([key, value]) => {
    if (isComponentThemeSectionLike(value)) {
      components[key] = value as NonNullable<PaletteDefinition['components']>[string]
      return
    }

    paletteUi[key] = value
  })

  return {
    ui: paletteUi,
    components,
  }
}

function parseThemeTokenName(tokenName: string): ParsedThemeTokenTarget | null {
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

function parseCssVariableBlock(content: string, selector: string) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = content.match(new RegExp(`${escapedSelector}\\s*\\{([\\s\\S]*?)\\}`, 'i'))

  if (!match?.[1]) {
    return {}
  }

  return Object.fromEntries(
    Array.from(match[1].matchAll(/(--ui-[a-z0-9-]+)\s*:\s*([^;]+);/gi))
      .map((entry) => [entry[1], entry[2]?.trim()])
      .filter((entry): entry is [string, string] => Boolean(entry[0] && entry[1]))
  )
}

function paletteFromCssVariables(content: string): PaletteDefinition | null {
  const lightTokens = parseCssVariableBlock(content, ':root')
  const darkTokens = parseCssVariableBlock(content, '.dark')

  if (!Object.keys(lightTokens).length && !Object.keys(darkTokens).length) {
    return null
  }

  const palette: PaletteDefinition = {
    name: 'Imported CSS Theme',
    modes: {
      light: {},
      dark: {},
    },
  }

  ;([
    ['light', lightTokens],
    ['dark', darkTokens],
  ] as const).forEach(([modeKey, tokens]) => {
    Object.entries(tokens).forEach(([tokenName, tokenValue]) => {
      const target = parseThemeTokenName(tokenName)

      if (!target) {
        return
      }

      if (!palette.modes[modeKey][target.section]) {
        palette.modes[modeKey][target.section] = {}
      }

      const sectionTokens = palette.modes[modeKey][target.section]

      if (!sectionTokens) {
        return
      }

      sectionTokens[target.key] = tokenValue
    })
  })

  return palette
}

function extractBalancedObjectLiteral(content: string, startIndex: number) {
  const openIndex = content.indexOf('{', startIndex)

  if (openIndex === -1) {
    return null
  }

  let depth = 0
  let inString = false
  let stringQuote = ''
  let escaping = false

  for (let index = openIndex; index < content.length; index += 1) {
    const char = content[index]

    if (inString) {
      if (escaping) {
        escaping = false
        continue
      }

      if (char === '\\') {
        escaping = true
        continue
      }

      if (char === stringQuote) {
        inString = false
      }

      continue
    }

    if (char === '"' || char === '\'') {
      inString = true
      stringQuote = char
      continue
    }

    if (char === '{') {
      depth += 1
      continue
    }

    if (char === '}') {
      depth -= 1

      if (depth === 0) {
        return content.slice(openIndex, index + 1)
      }
    }
  }

  return null
}

function parseJsonLikeObjectLiteral(objectLiteral: string) {
  return JSON.parse(
    objectLiteral.replace(/([{,]\s*)([A-Za-z_$][\w$]*)(\s*:)/g, '$1"$2"$3')
  ) as Record<string, unknown>
}

function parseThemeVariablesToMode(themeTokens: Record<string, string> | undefined) {
  const mode: PaletteDefinition['modes']['light'] = {}

  if (!themeTokens) {
    return mode
  }

  Object.entries(themeTokens).forEach(([tokenName, tokenValue]) => {
    const target = parseThemeTokenName(tokenName)

    if (!target) {
      return
    }

    if (!mode[target.section]) {
      mode[target.section] = {}
    }

    const sectionTokens = mode[target.section]

    if (!sectionTokens) {
      return
    }

    sectionTokens[target.key] = tokenValue
  })

  return mode
}

function parseExportedThemeModule(content: string): ExportedThemeModule | null {
  const themeExportIndex = content.indexOf('export const theme')
  const uiExportIndex = content.indexOf('export const ui')
  const componentsExportIndex = content.indexOf('export const components')

  if (themeExportIndex === -1 && componentsExportIndex === -1 && uiExportIndex === -1) {
    return null
  }

  const exportedModule: ExportedThemeModule = {}

  if (themeExportIndex !== -1) {
    const themeLiteral = extractBalancedObjectLiteral(content, themeExportIndex)

    if (themeLiteral) {
      exportedModule.theme = parseJsonLikeObjectLiteral(themeLiteral) as ExportedThemeModule['theme']
    }
  }

  if (componentsExportIndex !== -1) {
    const componentsLiteral = extractBalancedObjectLiteral(content, componentsExportIndex)

    if (componentsLiteral) {
      exportedModule.components = JSON.parse(componentsLiteral) as PaletteDefinition['components']
    }
  }

  if (uiExportIndex !== -1) {
    const uiLiteral = extractBalancedObjectLiteral(content, uiExportIndex)

    if (uiLiteral) {
      exportedModule.ui = JSON.parse(uiLiteral) as Record<string, unknown>
    }
  }

  return exportedModule.theme || exportedModule.components || exportedModule.ui ? exportedModule : null
}

function paletteFromExportedThemeModule(content: string): PaletteDefinition | null {
  const exportedThemeModule = parseExportedThemeModule(content)

  if (!exportedThemeModule?.theme) {
    return null
  }

  const splitUiConfig = splitUiConfigEntries(exportedThemeModule.ui)

  return {
    name: 'Imported Theme Module',
    modes: {
      light: parseThemeVariablesToMode(exportedThemeModule.theme.light),
      dark: parseThemeVariablesToMode(exportedThemeModule.theme.dark),
    },
    ui: splitUiConfig.ui,
    components: {
      ...splitUiConfig.components,
      ...(exportedThemeModule.components ?? {}),
    },
  }
}

function parseAppConfigModule(content: string): ParsedAppConfigModule | null {
  const appConfigIndex = content.indexOf('defineAppConfig')

  if (appConfigIndex === -1) {
    return null
  }

  const appConfigLiteral = extractBalancedObjectLiteral(content, appConfigIndex)

  if (!appConfigLiteral) {
    return null
  }

  return parseJsonLikeObjectLiteral(appConfigLiteral) as ParsedAppConfigModule
}

function paletteFromAppConfigModule(content: string): PaletteDefinition | null {
  const appConfig = parseAppConfigModule(content)
  const uiConfig = appConfig?.ui

  if (!uiConfig?.theme) {
    return null
  }

  const { theme, ...componentConfig } = uiConfig
  const splitUiConfig = splitUiConfigEntries(componentConfig)

  return {
    name: 'Imported App Config Theme',
    modes: {
      light: parseThemeVariablesToMode(theme.light),
      dark: parseThemeVariablesToMode(theme.dark),
    },
    ui: splitUiConfig.ui,
    components: splitUiConfig.components,
  }
}

export function isPaletteDefinitionLike(value: unknown): value is PaletteDefinition {
  if (!value || typeof value !== 'object') {
    return false
  }

  const palette = value as Partial<PaletteDefinition>

  return typeof palette.name === 'string'
    && Boolean(palette.modes)
    && typeof palette.modes === 'object'
    && Boolean(palette.modes.light)
    && typeof palette.modes.light === 'object'
    && Boolean(palette.modes.dark)
    && typeof palette.modes.dark === 'object'
}

export function normalizeImportedPalette(value: unknown): PaletteDefinition {
  if (!isPaletteDefinitionLike(value)) {
    throw new Error('Invalid palette file')
  }

  return normalizePaletteDefinition(value)
}

export function normalizeImportedPaletteFromText(content: string): PaletteDefinition {
  const trimmedContent = content.trim()

  if (!trimmedContent) {
    throw new Error('Invalid palette file')
  }

  try {
    return normalizeImportedPalette(JSON.parse(trimmedContent) as unknown)
  }
  catch {
    const exportedThemePalette = paletteFromExportedThemeModule(trimmedContent)

    if (exportedThemePalette) {
      return normalizePaletteDefinition(exportedThemePalette)
    }

    const appConfigPalette = paletteFromAppConfigModule(trimmedContent)

    if (appConfigPalette) {
      return normalizePaletteDefinition(appConfigPalette)
    }

    const cssPalette = paletteFromCssVariables(trimmedContent)

    if (!cssPalette) {
      throw new Error('Invalid palette file')
    }

    return normalizePaletteDefinition(cssPalette)
  }
}

export function serializePaletteExport(palette: PaletteDefinition) {
  return JSON.stringify(normalizePaletteDefinition(palette), null, 2)
}
