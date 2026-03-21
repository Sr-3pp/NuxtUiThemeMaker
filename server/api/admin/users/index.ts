import { createError, defineEventHandler } from 'h3'
import { listAdminUsers } from '~~/server/db/repositories/admin/users-repository'
import { requireAuthSession } from '~~/server/utils/auth-session'

export default defineEventHandler(async (event) => {
  const session = await requireAuthSession(event)

  if (!session.user.isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required',
    })
  }

  return listAdminUsers()
})
