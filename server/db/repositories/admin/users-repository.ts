import type { AdminUserListItem } from '~/types/admin-user'
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

function normalizeNullableDate(value: unknown) {
  if (value instanceof Date) {
    return value.toISOString()
  }

  if (typeof value === 'string') {
    return value
  }

  return null
}

export async function listAdminUsers(): Promise<AdminUserListItem[]> {
  const users = await listUserDocuments({
    projection: {
      id: 1,
      name: 1,
      email: 1,
      emailVerified: 1,
      isAdmin: 1,
      plan: 1,
      planStatus: 1,
      planInterval: 1,
      planExpiresAt: 1,
      aiPaletteGenerationsUsed: 1,
      createdAt: 1,
      updatedAt: 1,
    },
    sort: { createdAt: -1 },
  })

  return users.map(user => ({
    id: String(user.id ?? user._id),
    name: typeof user.name === 'string' ? user.name : '',
    email: typeof user.email === 'string' ? user.email : '',
    emailVerified: Boolean(user.emailVerified),
    isAdmin: Boolean(user.isAdmin),
    plan: user.plan === 'pro' || user.plan === 'team' ? user.plan : 'free',
    planStatus: user.planStatus === 'trialing'
      || user.planStatus === 'active'
      || user.planStatus === 'past_due'
      || user.planStatus === 'canceled'
      ? user.planStatus
      : 'inactive',
    planInterval: user.planInterval === 'monthly' || user.planInterval === 'yearly'
      ? user.planInterval
      : null,
    planExpiresAt: normalizeNullableDate(user.planExpiresAt),
    aiPaletteGenerationsUsed: typeof user.aiPaletteGenerationsUsed === 'number'
      ? user.aiPaletteGenerationsUsed
      : 0,
    createdAt: normalizeDate(user.createdAt),
    updatedAt: normalizeDate(user.updatedAt),
  }))
}
