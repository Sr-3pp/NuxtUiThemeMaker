import type { StoredPalette } from '~/types/palette-store'
import type { PaletteDefinition } from '~/types/palette'
import type { PaletteReview, PaletteReviewSummary } from '~/types/palette-review'
import type { PaletteLifecycleStatus, PaletteVersionSnapshot } from '~/types/palette-version'
import { normalizePaletteDefinition } from '../../app/utils/palette-domain'
import type { PaletteDocument } from '~~/server/types/palette-document'
import type { PaletteReviewDocument } from '~~/server/types/palette-review-document'
import type { PaletteVersionDocument } from '~~/server/types/palette-version-document'

export function toStoredPalette(document: PaletteDocument, viewerUserId?: string | null): StoredPalette {
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
    forkedFrom: document.forkedFrom ?? null,
    collaborators: document.collaborators ?? [],
    accessLevel: viewerUserId && document.userId !== viewerUserId ? 'shared' : 'owner',
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

export function toPaletteReview(document: PaletteReviewDocument): PaletteReview {
  if (!document._id) {
    throw new Error('Palette review document is missing _id')
  }

  return {
    id: document._id.toHexString(),
    paletteId: document.paletteId.toHexString(),
    userId: document.userId,
    userName: document.userName,
    status: document.status,
    message: document.message,
    createdAt: document.createdAt.toISOString(),
  }
}

export function summarizePaletteReviews(reviews: PaletteReview[]): PaletteReviewSummary {
  return reviews.reduce<PaletteReviewSummary>((summary, review) => {
    summary.total += 1

    if (review.status === 'approved') {
      summary.approvals += 1
      return summary
    }

    if (review.status === 'changes_requested') {
      summary.changesRequested += 1
      return summary
    }

    summary.comments += 1
    return summary
  }, {
    total: 0,
    approvals: 0,
    comments: 0,
    changesRequested: 0,
  })
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
