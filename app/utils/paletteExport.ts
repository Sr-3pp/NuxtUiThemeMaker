import type { PaletteDefinition } from '~/types/palette'
import { serializePaletteExport } from './palette-io'
import themeBuilder from './theme-builder'

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

export function exportPaletteCss(palette: PaletteDefinition) {
  const lightTheme = themeBuilder(palette.modes.light)
  const darkTheme = themeBuilder(palette.modes.dark)

  return [
    formatThemeBlock(':root', lightTheme),
    formatThemeBlock('.dark', darkTheme)
  ].join('\n\n')
}

export function exportPaletteTs(palette: PaletteDefinition) {
  const lightTheme = themeBuilder(palette.modes.light)
  const darkTheme = themeBuilder(palette.modes.dark)
  const components = palette.components ?? {}

  return [
    'export const theme = {',
    `  light: ${JSON.stringify(lightTheme, null, 2).replace(/\n/g, '\n  ')},`,
    `  dark: ${JSON.stringify(darkTheme, null, 2).replace(/\n/g, '\n  ')}`,
    '}',
    '',
    'export const components = ',
    `${JSON.stringify(components, null, 2)}`,
  ].join('\n')
}

export function exportPaletteComponentsTs(palette: PaletteDefinition) {
  return [
    'export const components = ',
    `${JSON.stringify(palette.components ?? {}, null, 2)}`,
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
