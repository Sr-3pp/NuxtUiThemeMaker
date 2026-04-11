import { createError } from 'h3'
import type { PaletteReviewThread } from '~/types/palette-review'
import type { AuthSessionUser } from '~~/server/types/auth-session'
import { listPaletteReviewsByPaletteId, createPaletteReview } from '~~/server/db/repositories/palette-review-repository'
import { findPaletteById } from '~~/server/db/repositories/palette-repository'
import { summarizePaletteReviews, toPaletteReview } from '../domain/palette'
import { parsePaletteObjectId } from '~~/server/services/palette-helpers'

async function getAccessiblePaletteByIdOrThrow(id: string, userId?: string | null) {
  const objectId = parsePaletteObjectId(id)
  const palette = await findPaletteById(objectId)

  if (!palette) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Palette not found',
    })
  }

  if (!palette.isPublic && palette.userId !== userId) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Palette not found',
    })
  }

  return palette
}

export async function listPaletteReviewsForViewer(id: string, userId?: string | null): Promise<PaletteReviewThread> {
  const palette = await getAccessiblePaletteByIdOrThrow(id, userId)
  const reviews = (await listPaletteReviewsByPaletteId(palette._id!)).map(toPaletteReview)

  return {
    summary: summarizePaletteReviews(reviews),
    reviews,
  }
}

export async function createPaletteReviewForUser(
  id: string,
  user: Pick<AuthSessionUser, 'id' | 'name'>,
  input: {
    status: 'commented' | 'approved' | 'changes_requested'
    message: string
  },
) {
  const palette = await getAccessiblePaletteByIdOrThrow(id, user.id)
  const document = await createPaletteReview({
    paletteId: palette._id!,
    userId: user.id,
    userName: user.name,
    status: input.status,
    message: input.message.trim(),
    createdAt: new Date(),
  })

  if (!document) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create review',
    })
  }

  return toPaletteReview(document)
}
