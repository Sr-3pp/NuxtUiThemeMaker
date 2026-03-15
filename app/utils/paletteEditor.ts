import type { PaletteTokenGroup, PaletteTokenValue } from '~/types/palette'

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

export function getRadiusSliderValue(tokens: PaletteTokenGroup, tokenKey: string) {
  const value = tokens[tokenKey]

  if (!value) {
    return 0
  }

  const normalized = value.trim().toLowerCase()

  if (normalized.endsWith('rem')) {
    const remValue = Number.parseFloat(normalized.slice(0, -3))
    return Number.isFinite(remValue) ? Math.round(remValue * 16) : 0
  }

  const numericValue = Number.parseFloat(normalized)
  return Number.isFinite(numericValue) ? Math.round(numericValue) : 0
}

export function formatRadiusSliderValue(value: number) {
  const remValue = value / 16
  const normalized = Number.isInteger(remValue) ? String(remValue) : remValue.toFixed(3).replace(/\.?0+$/, '')
  return `${normalized}rem`
}

export function paletteTokenStyle(value: PaletteTokenValue | undefined) {
  return { backgroundColor: value ?? 'transparent' }
}
