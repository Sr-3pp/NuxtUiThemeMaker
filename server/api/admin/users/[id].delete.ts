import { createError, defineEventHandler } from 'h3'
import { deleteAdminManagedUser } from '~~/server/services/admin-users'
import { requireAuthSession } from '~~/server/utils/auth-session'

export default defineEventHandler(async (event) => {
  const session = await requireAuthSession(event)

  if (!session.user.isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required',
    })
  }

  const userId = getRouterParam(event, 'id')

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing user id',
    })
  }

  await deleteAdminManagedUser(session.user.id, userId)

  return {
    success: true,
  }
})
