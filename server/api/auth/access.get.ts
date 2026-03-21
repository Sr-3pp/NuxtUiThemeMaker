import { defineEventHandler } from 'h3'
import type { AuthAccess } from '~/types/auth-access'
import { getOptionalAuthSession } from '~~/server/utils/auth-session'

export default defineEventHandler(async (event) => {
  const session = await getOptionalAuthSession(event)

  return {
    isAuthenticated: Boolean(session),
    isAdmin: Boolean(session?.user.isAdmin),
  } satisfies AuthAccess
})
