import type { StoredPalette } from '~/types/palette-store'
import type { PaletteDefinition } from '~/types/palette'
import type { PaletteLifecycleStatus, PaletteVersionSnapshot } from '~/types/palette-version'
import { normalizePaletteDefinition } from '../../app/utils/palette-domain'
import type { PaletteDocument } from '~~/server/types/palette-document'
import type { PaletteVersionDocument } from '~~/server/types/palette-version-document'

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
    lifecycleStatus: document.lifecycleStatus ?? getPaletteLifecycleStatus(document.isPublic),
    version: document.version ?? 1,
    publishedAt: document.publishedAt?.toISOString() ?? null,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  }
}

export function toPaletteVersionSnapshot(document: PaletteVersionDocument): PaletteVersionSnapshot {
  if (!document._id) {
    throw new Error('Palette version document is missing _id')
  }

  return {
    id: document._id.toHexString(),
    paletteId: document.paletteId.toHexString(),
    version: document.version,
    name: document.name,
    palette: document.palette,
    lifecycleStatus: document.lifecycleStatus,
    isPublic: document.isPublic,
    event: document.event,
    createdAt: document.createdAt.toISOString(),
  }
}

export function normalizePaletteForStorage(name: string, palette: PaletteDefinition): PaletteDefinition {
  return normalizePaletteDefinition({
    ...palette,
    name,
  })
}

export function getPaletteLifecycleStatus(isPublic: boolean): PaletteLifecycleStatus {
  return isPublic ? 'published' : 'draft'
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
