import type { StoredPalette } from '~/types/palette-store'
import type { PaletteDefinition } from '~/types/palette'
import type { PaletteDocument } from '~~/server/db/collections/palettes'

export function toStoredPalette(document: PaletteDocument): StoredPalette {
  if (!document._id) {
    throw new Error('Palette document is missing _id')
  }

  return {
    _id: document._id.toHexString(),
    userId: document.userId,
    slug: document.slug,
    name: document.name,
    palette: document.palette,
    isPublic: document.isPublic,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  }
}

export function normalizePaletteForStorage(name: string, palette: PaletteDefinition): PaletteDefinition {
  return {
    ...palette,
    name,
  }
}

export function createSlugBase(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return slug || 'palette'
}
