import { randomUUID } from 'node:crypto'
import { createError } from 'h3'
import { ObjectId } from 'mongodb'
import { createSlugBase } from '~~/server/domain/palette'
import { findPaletteBySlug } from '~~/server/db/repositories/palette-repository'

export function parsePaletteObjectId(id: string) {
  if (!ObjectId.isValid(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid palette id',
    })
  }

  return new ObjectId(id)
}

export async function generateUniquePaletteSlug(name: string, currentId?: ObjectId) {
  const baseSlug = createSlugBase(name)
  let slug = baseSlug
  let attempt = 0

  while (true) {
    const existing = await findPaletteBySlug(slug)

    if (!existing || (currentId && existing._id.equals(currentId))) {
      return slug
    }

    attempt += 1
    slug = `${baseSlug}-${randomUUID().slice(0, Math.min(4 + attempt, 8))}`
  }
}
