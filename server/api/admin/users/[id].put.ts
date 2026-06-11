import { defineEventHandler, readValidatedBody } from 'h3'
import { z } from 'zod'
import type { AdminUserUpdateInput } from '~/types/admin-user'
import { updateAdminManagedUser } from '~~/server/services/admin-users'
import { requireAdminSession } from '~~/server/utils/admin-auth'
import { requireRouterParam } from '~~/server/utils/route-params'

const updateAdminUserSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.email('A valid email is required'),
  isAdmin: z.boolean(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
})

export default defineEventHandler(async (event) => {
  const session = await requireAdminSession(event)
  const userId = requireRouterParam(event, 'id', 'user id')

  const parsedBody = await readValidatedBody(event, updateAdminUserSchema.parse)

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
