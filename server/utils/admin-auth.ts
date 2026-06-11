import { createError } from 'h3'
import type { H3Event } from 'h3'
import type { AuthSession } from '~~/server/types/auth-session'
import { requireAuthSession } from '~~/server/utils/auth-session'

export async function requireAdminSession(event: H3Event): Promise<AuthSession> {
  const session = await requireAuthSession(event)

  if (!session.user.isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required',
    })
  }

  return session
}
