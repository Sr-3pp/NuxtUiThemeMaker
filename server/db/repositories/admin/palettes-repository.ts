import { ObjectId } from 'mongodb'
import type { AdminPaletteListItem } from '~/types/admin-palette'
import { getPaletteCollection } from '~~/server/db/collections/palettes'
import { listUserDocuments } from '~~/server/db/repositories/user-repository'

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
  const userIds = [...new Set(palettes
    .map(palette => typeof palette.userId === 'string' ? palette.userId : '')
    .filter(Boolean))]
  const objectUserIds = userIds
    .filter(userId => ObjectId.isValid(userId))
    .map(userId => new ObjectId(userId))
  const users = userIds.length > 0
    ? await listUserDocuments({
        filter: {
          $or: [
            { id: { $in: userIds } },
            { _id: { $in: userIds } },
            ...(objectUserIds.length > 0 ? [{ _id: { $in: objectUserIds } }] : []),
          ],
        },
        projection: {
          id: 1,
          name: 1,
        },
      })
    : []
  const usersById = new Map(users.map(user => [
    String(user.id ?? user._id),
    typeof user.name === 'string' ? user.name : '',
  ]))

  return palettes.map(palette => ({
    id: String(palette._id),
    userId: typeof palette.userId === 'string' ? palette.userId : '',
    ownerName: typeof palette.userId === 'string' ? usersById.get(palette.userId) ?? '' : '',
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
