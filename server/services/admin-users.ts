import { createError } from 'h3'
import type { AdminUserUpdateInput } from '~/types/admin-user'
import { getAuth } from '~~/server/utils/auth'

export async function updateAdminManagedUser(
  actorUserId: string,
  targetUserId: string,
  input: AdminUserUpdateInput,
) {
  const auth = await getAuth()
  const context = await auth.$context
  const existingUser = await context.internalAdapter.findUserById(targetUserId)

  if (!existingUser) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found',
    })
  }

  if (actorUserId === targetUserId && !input.isAdmin) {
    throw createError({
      statusCode: 400,
      statusMessage: 'You cannot remove your own admin access',
    })
  }

  const updatedUser = await context.internalAdapter.updateUser(targetUserId, {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    isAdmin: input.isAdmin,
  })

  if (!updatedUser) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update user',
    })
  }

  if (input.newPassword) {
    const hashedPassword = await context.password.hash(input.newPassword)
    await context.internalAdapter.updatePassword(targetUserId, hashedPassword)
  }

  return updatedUser
}

export async function deleteAdminManagedUser(
  actorUserId: string,
  targetUserId: string,
) {
  if (actorUserId === targetUserId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'You cannot delete your own account from the admin panel',
    })
  }

  const auth = await getAuth()
  const context = await auth.$context
  const existingUser = await context.internalAdapter.findUserById(targetUserId)

  if (!existingUser) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found',
    })
  }

  await context.internalAdapter.deleteUser(targetUserId)
}
