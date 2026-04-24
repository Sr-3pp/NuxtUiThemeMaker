
import { z } from 'zod'
import type { AdminUserUpdateInput } from '~/types/admin-user'
import { updateAdminManagedUser } from '~~/server/services/admin-users'
import { requireAuthSession } from '~~/server/utils/auth-session'

const updateAdminUserSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.email('A valid email is required'),
  isAdmin: z.boolean(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
})

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

  const body = await readBody(event)
  const parsedBody = updateAdminUserSchema.parse(body)

  await updateAdminManagedUser(session.user.id, userId, {
    name: parsedBody.name,
    email: parsedBody.email,
    isAdmin: parsedBody.isAdmin,
    ...(parsedBody.newPassword ? { newPassword: parsedBody.newPassword } : {}),
  } satisfies AdminUserUpdateInput)

  return {
    success: true,
  }
})
