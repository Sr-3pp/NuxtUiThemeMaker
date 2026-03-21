import { createError, defineEventHandler } from 'h3'
import { deleteAdminManagedPalette } from '~~/server/services/admin-palettes'
import { requireAuthSession } from '~~/server/utils/auth-session'

export default defineEventHandler(async (event) => {
  const session = await requireAuthSession(event)

  if (!session.user.isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required',
    })
  }

  const paletteId = getRouterParam(event, 'id')

  if (!paletteId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing palette id',
    })
  }

  await deleteAdminManagedPalette(paletteId)

  return {
    success: true,
  }
})
