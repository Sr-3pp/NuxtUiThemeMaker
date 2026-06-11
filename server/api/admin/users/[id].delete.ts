import { defineEventHandler } from 'h3'
import { deleteAdminManagedUser } from '~~/server/services/admin-users'
import { requireAdminSession } from '~~/server/utils/admin-auth'
import { requireRouterParam } from '~~/server/utils/route-params'

export default defineEventHandler(async (event) => {
  const session = await requireAdminSession(event)
  const userId = requireRouterParam(event, 'id', 'user id')

  await deleteAdminManagedUser(session.user.id, userId)

  return {
    success: true,
  }
})
