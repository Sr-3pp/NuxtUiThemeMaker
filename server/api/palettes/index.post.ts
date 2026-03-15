import { createError, defineEventHandler, readValidatedBody } from 'h3'
import { normalizePaletteForStorage, toStoredPalette } from '~~/server/domain/palette'
import { paletteWriteSchema } from '~~/server/domain/palette-schema'
import {
  countPalettesByUserId,
  createPalette,
  generateUniquePaletteSlug,
} from '~~/server/db/repositories/palette-repository'
import { requireAuthSession } from '~~/server/utils/auth-session'

const FREE_PLAN_PALETTE_LIMIT = 2

export default defineEventHandler(async (event) => {
  const { user } = await requireAuthSession(event)
  const body = await readValidatedBody(event, paletteWriteSchema.parse)
  const name = body.name.trim()

  if (user.plan === 'free') {
    const paletteCount = await countPalettesByUserId(user.id)

    if (paletteCount >= FREE_PLAN_PALETTE_LIMIT) {
      throw createError({
        statusCode: 403,
        statusMessage: `Free plan users can only save ${FREE_PLAN_PALETTE_LIMIT} palettes`,
      })
    }
  }

  const now = new Date()
  const slug = await generateUniquePaletteSlug(name)
  const palette = normalizePaletteForStorage(name, body.palette)

  const document = await createPalette({
    userId: user.id,
    slug,
    name,
    palette,
    isPublic: body.isPublic ?? false,
    createdAt: now,
    updatedAt: now,
  })

  if (!document) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create palette',
    })
  }

  return toStoredPalette(document)
})
