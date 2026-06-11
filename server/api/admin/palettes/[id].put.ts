import { defineEventHandler, readValidatedBody } from 'h3'
import { z } from 'zod'
import type { AdminPaletteUpdateInput } from '~/types/admin-palette'
import { updateAdminManagedPalette } from '~~/server/services/admin-palettes'
import { requireAdminSession } from '~~/server/utils/admin-auth'
import { requireRouterParam } from '~~/server/utils/route-params'

const updateAdminPaletteSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  isPublic: z.boolean(),
})

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)
  const paletteId = requireRouterParam(event, 'id', 'palette id')

  const parsedBody = await readValidatedBody(event, updateAdminPaletteSchema.parse)

  await updateAdminManagedPalette(paletteId, {
    name: parsedBody.name,
    isPublic: parsedBody.isPublic,
  } satisfies AdminPaletteUpdateInput)

  return {
    success: true,
  }
})
