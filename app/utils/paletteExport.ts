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

  return Object.fromEntries(
    Object.entries(colors)
      .flatMap(([colorKey, scale]) => paletteScaleSteps.map((step) => {
        const value = scale[step]

        if (value == null) {
          return null
        }

        return [`--ui-color-${colorKey}-${step}`, value] as const
      }))
      .filter((entry): entry is readonly [string, string] => entry !== null)
  )
}

function buildPaletteExportData(palette: PaletteDefinition): PaletteExportData {
  const normalizedPalette = normalizePaletteDefinition(palette)

  return {
    palette: normalizedPalette,
    theme: {
      light: {
        ...themeBuilder(normalizedPalette.modes.light),
        ...buildRampTokens(normalizedPalette.colors),
      },
      dark: themeBuilder(normalizedPalette.modes.dark),
    },
    components: normalizedPalette.components ?? {},
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
  const { theme, components } = buildPaletteExportData(palette)

  return [
    'export const theme = {',
    `  light: ${JSON.stringify(theme.light, null, 2).replace(/\n/g, '\n  ')},`,
    `  dark: ${JSON.stringify(theme.dark, null, 2).replace(/\n/g, '\n  ')}`,
    '}',
    '',
    'export const components = ',
    `${JSON.stringify(components, null, 2)}`,
  ].join('\n')
}

export function exportPaletteComponentsTs(palette: PaletteDefinition) {
  const { components } = buildPaletteExportData(palette)

  return [
    'export const components = ',
    `${JSON.stringify(components, null, 2)}`,
  ].join('\n')
}

export function exportPaletteAppConfig(_palette: PaletteDefinition) {
  return [
    "import { components, theme } from './theme'",
    '',
    'export default defineAppConfig({',
    '  ui: {',
    '    theme,',
    '    ...components',
    '  }',
    '})'
  ].join('\n')
}

export function exportPaletteInstallSnippet(_palette: PaletteDefinition) {
  return [
    '// 1. Save the generated files as theme.ts and app.config.ts',
    '// 2. Keep both exports in your Nuxt app root or adjust the import path',
    '',
    "import { components, theme } from './theme'",
    '',
    'export default defineAppConfig({',
    '  ui: {',
    '    theme,',
    '    ...components',
    '  }',
    '})',
  ].join('\n')
}

export function exportPaletteBundleTs(palette: PaletteDefinition) {
  const { theme, components } = buildPaletteExportData(palette)

  return [
    'export const theme = {',
    `  light: ${JSON.stringify(theme.light, null, 2).replace(/\n/g, '\n  ')},`,
    `  dark: ${JSON.stringify(theme.dark, null, 2).replace(/\n/g, '\n  ')}`,
    '}',
    '',
    'export const components = ',
    `${JSON.stringify(components, null, 2)}`,
    '',
    'export default defineAppConfig({',
    '  ui: {',
    '    theme,',
    '    ...components',
    '  }',
    '})',
  ].join('\n')
}
