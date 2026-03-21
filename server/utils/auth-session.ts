import { fromNodeHeaders } from 'better-auth/node'
import { createError } from 'h3'
import type { H3Event } from 'h3'
import type { AuthSession } from '~~/server/types/auth-session'
import { getAuth } from './auth'

export async function getOptionalAuthSession(event: H3Event): Promise<AuthSession | null> {
  const auth = await getAuth()
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(event.node.req.headers),
  })

  return session as AuthSession | null
}

export async function requireAuthSession(event: H3Event): Promise<AuthSession> {
  const session = await getOptionalAuthSession(event)

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required',
    })
  }

  return session
}
