import type { PaletteColorScales, PaletteDefinition } from '../types/palette'
import { paletteScaleSteps } from '../types/palette'
import { normalizePaletteDefinition } from './palette-domain'
import { serializePaletteExport, splitUiConfigEntries, normalizeComponentThemes } from './palette-io'
import themeBuilder from './theme-builder'

interface PaletteExportData {
  palette: PaletteDefinition
  cssVars: {
    light: Record<string, string>
    dark: Record<string, string>
  }
  ui: Record<string, unknown>
  components: NonNullable<PaletteDefinition['components']>
}

function formatThemeBlock(selector: string, tokens: Record<string, string>) {
  const entries = Object.entries(tokens)

  if (entries.length === 0) {
    return `${selector} {}`
  }

  return [
    `${selector} {`,
    ...entries.map(([token, value]) => `  ${token}: ${value};`),
    '}'
  ].join('\n')
}

export function exportPaletteJson(palette: PaletteDefinition) {
  return serializePaletteExport(palette)
}

function buildRampTokens(colors?: PaletteColorScales) {
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

function buildPaletteExportData(palette: PaletteDefinition): PaletteExportData {
  const normalizedPalette = normalizePaletteDefinition(palette)
  
  // Separate component overrides from other UI config
  // Components may be mixed in the ui field or already separated
  const allUiConfig = {
    ...(normalizedPalette.ui ?? {}),
    ...(normalizedPalette.components ?? {}),
  }
  const { ui, components: rawComponents } = splitUiConfigEntries(allUiConfig)
  
  // Normalize component values to Nuxt UI format (flat strings instead of {class: "..."})
  const components = normalizeComponentThemes(rawComponents)
  
  const cssVars = {
    light: {
      ...themeBuilder(normalizedPalette.modes.light),
      ...buildRampTokens(normalizedPalette.colors),
    },
    dark: themeBuilder(normalizedPalette.modes.dark),
  }

  return {
    palette: normalizedPalette,
    cssVars,
    ui,
    components,
  }
}

/**
 * Builds the complete Nuxt UI app.config.ui object structure.
 * Includes theme (CSS custom properties) and all component overrides.
 */
function buildNuxtUiConfig(data: PaletteExportData): Record<string, unknown> {
  return {
    theme: data.cssVars,
    ...data.ui,
    ...data.components,
  }
}

export function exportPaletteCss(palette: PaletteDefinition) {
  const { cssVars } = buildPaletteExportData(palette)

  return [
    formatThemeBlock(':root', cssVars.light),
    formatThemeBlock('.dark', cssVars.dark)
  ].join('\n\n')
}

export function exportPaletteTs(palette: PaletteDefinition) {
  const data = buildPaletteExportData(palette)
  const uiConfig = buildNuxtUiConfig(data)

  return [
    '// CSS custom properties for light and dark modes',
    'export const theme = {',
    `  light: ${JSON.stringify(data.cssVars.light, null, 2).replace(/\n/g, '\n  ')},`,
    `  dark: ${JSON.stringify(data.cssVars.dark, null, 2).replace(/\n/g, '\n  ')}`,
    '}',
    '',
    '// Component overrides',
    'export const components = ',
    `${JSON.stringify(data.components, null, 2)}`,
    '',
    '// Complete Nuxt UI config (theme + components)',
    'export const ui = ',
    `${JSON.stringify(uiConfig, null, 2)}`,
  ].join('\n')
}

export function exportPaletteComponentsTs(palette: PaletteDefinition) {
  const data = buildPaletteExportData(palette)

  return [
    '// Component overrides only (no theme CSS variables)',
    'export const components = ',
    `${JSON.stringify(data.components, null, 2)}`,
  ].join('\n')
}

export function exportPaletteAppConfig(_palette: PaletteDefinition) {
  return [
    "import { ui } from './theme'",
    '',
    'export default defineAppConfig({',
    '  ui,',
    '})'
  ].join('\n')
}

export function exportPaletteInstallSnippet(_palette: PaletteDefinition) {
  return [
    '// 1. Save the generated files as theme.ts and app.config.ts',
    '// 2. Keep both exports in your Nuxt app root or adjust the import path',
    '',
    "import { ui } from './theme'",
    '',
    'export default defineAppConfig({',
    '  ui,',
    '})',
  ].join('\n')
}

export function exportPaletteBundleTs(palette: PaletteDefinition) {
  const data = buildPaletteExportData(palette)
  const uiConfig = buildNuxtUiConfig(data)

  return [
    '// All-in-one Nuxt UI theme configuration',
    '// Place this file as app.config.ts in your Nuxt app root',
    '',
    'export const theme = {',
    `  light: ${JSON.stringify(data.cssVars.light, null, 2).replace(/\n/g, '\n  ')},`,
    `  dark: ${JSON.stringify(data.cssVars.dark, null, 2).replace(/\n/g, '\n  ')}`,
    '}',
    '',
    'export const components = ',
    `${JSON.stringify(data.components, null, 2)}`,
    '',
    'export const ui = ',
    `${JSON.stringify(uiConfig, null, 2)}`,
    '',
    'export default defineAppConfig({',
    '  ui,',
    '})',
  ].join('\n')
}
