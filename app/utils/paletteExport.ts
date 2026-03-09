import type { PaletteDefinition } from '~/types/palette'
import themeBuilder from '~/utils/theme-builder'

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
  return JSON.stringify(palette, null, 2)
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

  return [
    'export const theme = {',
    `  light: ${JSON.stringify(lightTheme, null, 2).replace(/\n/g, '\n  ')},`,
    `  dark: ${JSON.stringify(darkTheme, null, 2).replace(/\n/g, '\n  ')}`,
    '}'
  ].join('\n')
}

export function exportPaletteAppConfig(_palette: PaletteDefinition) {
  return [
    "import { theme } from './theme'",
    '',
    'export default defineAppConfig({',
    '  ui: {',
    '    theme',
    '  }',
    '})'
  ].join('\n')
}
