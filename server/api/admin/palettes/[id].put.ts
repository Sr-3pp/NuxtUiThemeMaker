import { createError, defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import type { AdminPaletteUpdateInput } from '~/types/admin-palette'
import { updateAdminManagedPalette } from '~~/server/services/admin-palettes'
import { requireAuthSession } from '~~/server/utils/auth-session'

const updateAdminPaletteSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  isPublic: z.boolean(),
})

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

  const body = await readBody(event)
  const parsedBody = updateAdminPaletteSchema.parse(body)

  await updateAdminManagedPalette(paletteId, {
    name: parsedBody.name,
    isPublic: parsedBody.isPublic,
  } satisfies AdminPaletteUpdateInput)

  return {
    success: true,
  }
})
