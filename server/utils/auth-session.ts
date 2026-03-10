import { fromNodeHeaders } from 'better-auth/node'
import type { H3Event } from 'h3'
import { getAuth } from './auth'

export async function getOptionalAuthSession(event: H3Event) {
  const auth = await getAuth()

  return auth.api.getSession({
    headers: fromNodeHeaders(event.node.req.headers),
  })
}

export async function requireAuthSession(event: H3Event) {
  const session = await getOptionalAuthSession(event)

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required',
    })
  }

  return session
}
