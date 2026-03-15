import { fromNodeHeaders } from 'better-auth/node'
import { createError } from 'h3'
import type { H3Event } from 'h3'
import { getAuth } from './auth'

type RawAuthSession = NonNullable<Awaited<ReturnType<Awaited<ReturnType<typeof getAuth>>['api']['getSession']>>>

type AuthSessionUser = RawAuthSession['user'] & {
  level: 'user' | 'admin'
  plan: 'free' | 'pro' | 'team'
  planStatus: 'inactive' | 'trialing' | 'active' | 'past_due' | 'canceled'
  stripeCustomerId: string | null
  planExpiresAt: Date | null
}

type AuthSession = Omit<RawAuthSession, 'user'> & {
  user: AuthSessionUser
}

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
