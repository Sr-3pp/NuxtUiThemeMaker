import type { PaletteMode, PaletteTokenGroup, PaletteTokenValue } from '~/types/palette'

export function formatPaletteLabel(value: string) {
  return value.replace(/-/g, ' ')
}

export function normalizePaletteTokenValue(value: string | number | undefined) {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return null
  }

  const nextValue = String(value).trim()
  return nextValue.length > 0 ? nextValue : null
}

export function getPaletteInputValue(tokens: PaletteTokenGroup, tokenKey: string) {
  return tokens[tokenKey] ?? ''
}

export function getPalettePickerValue(tokens: PaletteTokenGroup, tokenKey: string) {
  return tokens[tokenKey] ?? undefined
}

export function paletteModeEntries(mode: PaletteMode) {
  return Object.entries(mode) as Array<[string, PaletteTokenGroup]>
}

export function paletteTokenStyle(value: PaletteTokenValue | undefined) {
  return { backgroundColor: value ?? 'transparent' }
}
