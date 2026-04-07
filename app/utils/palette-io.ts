import type { PaletteDefinition } from '~/types/palette'
import { normalizePaletteDefinition } from './palette-domain'

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

export function serializePaletteExport(palette: PaletteDefinition) {
  return JSON.stringify(normalizePaletteDefinition(palette), null, 2)
}
