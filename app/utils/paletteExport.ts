import type { PaletteDefinition } from '../types/palette'
import { serializePaletteExport } from './palette-io'
import { buildNuxtUiConfig, buildPaletteThemeData } from './palette-theme'

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
  const { cssVars } = buildPaletteThemeData(palette)

  return [
    formatThemeBlock(':root', cssVars.light),
    formatThemeBlock('.dark', cssVars.dark)
  ].join('\n\n')
}

export function exportPaletteTs(palette: PaletteDefinition) {
  const data = buildPaletteThemeData(palette)
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
  const data = buildPaletteThemeData(palette)

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
  const data = buildPaletteThemeData(palette)
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
