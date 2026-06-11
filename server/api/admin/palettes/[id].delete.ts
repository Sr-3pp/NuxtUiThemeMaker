import { defineEventHandler } from 'h3'
import { deleteAdminManagedPalette } from '~~/server/services/admin-palettes'
import { requireAdminSession } from '~~/server/utils/admin-auth'
import { requireRouterParam } from '~~/server/utils/route-params'

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)
  const paletteId = requireRouterParam(event, 'id', 'palette id')

  await deleteAdminManagedPalette(paletteId)

  return {
    success: true,
  }
})
