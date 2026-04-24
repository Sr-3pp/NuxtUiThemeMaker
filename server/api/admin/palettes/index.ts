import { listAdminPalettes } from "~~/server/db/repositories/admin/palettes-repository"
import { requireAuthSession } from '~~/server/utils/auth-session'

export default defineEventHandler(async (event) => {
  const session = await requireAuthSession(event)

  if (!session || !session.user.isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required',
    })
  }

  const palettes = await listAdminPalettes()

  return palettes

})
