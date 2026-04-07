import type { PaletteDefinition } from '~/types/palette'
import { normalizePaletteDefinition } from './palette-domain'

const semanticColorKeys = new Set(['primary', 'secondary', 'neutral', 'success', 'info', 'warning', 'error'])
const knownUiKeys = new Set(['border', 'border-muted', 'border-accented', 'ring'])

interface ParsedThemeTokenTarget {
  section: string
  key: string
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
