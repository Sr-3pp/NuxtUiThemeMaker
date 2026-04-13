import type { PaletteColorScales, PaletteDefinition } from '../types/palette'
import { paletteScaleSteps } from '../types/palette'
import { normalizePaletteDefinition } from './palette-domain'
import { serializePaletteExport } from './palette-io'
import themeBuilder from './theme-builder'

interface PaletteExportData {
  palette: PaletteDefinition
  theme: {
    light: Record<string, string>
    dark: Record<string, string>
  }
  generatedUi: Record<string, unknown>
  components: NonNullable<PaletteDefinition['components']>
  mergedUi: Record<string, unknown>
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
  const generatedUi = normalizedPalette.ui ?? {}
  const components = normalizedPalette.components ?? {}
  const theme = {
    light: {
      ...themeBuilder(normalizedPalette.modes.light),
      ...buildRampTokens(normalizedPalette.colors),
    },
    dark: themeBuilder(normalizedPalette.modes.dark),
  }

  return {
    palette: normalizedPalette,
    theme,
    generatedUi,
    components,
    mergedUi: {
      theme,
      ...generatedUi,
      ...components,
    },
  }
}

export function exportPaletteCss(palette: PaletteDefinition) {
  const { theme } = buildPaletteExportData(palette)

  return [
    formatThemeBlock(':root', theme.light),
    formatThemeBlock('.dark', theme.dark)
  ].join('\n\n')
}

export function exportPaletteTs(palette: PaletteDefinition) {
  const { theme, generatedUi, components, mergedUi } = buildPaletteExportData(palette)

  return [
    'export const theme = {',
    `  light: ${JSON.stringify(theme.light, null, 2).replace(/\n/g, '\n  ')},`,
    `  dark: ${JSON.stringify(theme.dark, null, 2).replace(/\n/g, '\n  ')}`,
    '}',
    '',
    'export const generatedUi = ',
    `${JSON.stringify(generatedUi, null, 2)}`,
    '',
    'export const components = ',
    `${JSON.stringify(components, null, 2)}`,
    '',
    'export const ui = ',
    `${JSON.stringify(mergedUi, null, 2)}`,
  ].join('\n')
}

export function exportPaletteComponentsTs(palette: PaletteDefinition) {
  const { generatedUi, components, mergedUi } = buildPaletteExportData(palette)

  return [
    'export const generatedUi = ',
    `${JSON.stringify(generatedUi, null, 2)}`,
    '',
    'export const components = ',
    `${JSON.stringify(components, null, 2)}`,
    '',
    'export const ui = ',
    `${JSON.stringify(mergedUi, null, 2)}`,
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
  const { theme, generatedUi, components, mergedUi } = buildPaletteExportData(palette)

  return [
    'export const theme = {',
    `  light: ${JSON.stringify(theme.light, null, 2).replace(/\n/g, '\n  ')},`,
    `  dark: ${JSON.stringify(theme.dark, null, 2).replace(/\n/g, '\n  ')}`,
    '}',
    '',
    'export const generatedUi = ',
    `${JSON.stringify(generatedUi, null, 2)}`,
    '',
    'export const components = ',
    `${JSON.stringify(components, null, 2)}`,
    '',
    'export const ui = ',
    `${JSON.stringify(mergedUi, null, 2)}`,
    '',
    'export default defineAppConfig({',
    '  ui,',
    '})',
  ].join('\n')
}
