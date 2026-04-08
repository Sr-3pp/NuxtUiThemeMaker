import type { AdminPaletteListItem } from '~/types/admin-palette'
import { getPaletteCollection } from '~~/server/db/collections/palettes'

function normalizeDate(value: unknown) {
  if (value instanceof Date) {
    return value.toISOString()
  }

  if (typeof value === 'string') {
    return value
  }

  return new Date(0).toISOString()
}

export async function listAdminPalettes(): Promise<AdminPaletteListItem[]> {
  const collection = await getPaletteCollection()
  const palettes = await collection
    .find({}, {
      projection: {
        _id: 1,
        userId: 1,
        slug: 1,
        name: 1,
        isPublic: 1,
        lifecycleStatus: 1,
        version: 1,
        publishedAt: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    })
    .sort({ createdAt: -1 })
    .toArray()

  return palettes.map(palette => ({
    id: String(palette._id),
    userId: typeof palette.userId === 'string' ? palette.userId : '',
    slug: typeof palette.slug === 'string' ? palette.slug : '',
    name: typeof palette.name === 'string' ? palette.name : '',
    isPublic: Boolean(palette.isPublic),
    lifecycleStatus: palette.lifecycleStatus === 'published' ? 'published' : 'draft',
    version: typeof palette.version === 'number' ? palette.version : 1,
    publishedAt: palette.publishedAt instanceof Date ? palette.publishedAt.toISOString() : null,
    createdAt: normalizeDate(palette.createdAt),
    updatedAt: normalizeDate(palette.updatedAt),
  }))
}
