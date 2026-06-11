import { defineEventHandler } from 'h3'
import { toStoredPalette } from '~~/server/domain/palette'
import { getAdminManagedPalette } from '~~/server/services/admin-palettes'
import { requireAdminSession } from '~~/server/utils/admin-auth'
import { requireRouterParam } from '~~/server/utils/route-params'

export default defineEventHandler(async (event) => {
  const session = await requireAdminSession(event)
  const paletteId = requireRouterParam(event, 'id', 'palette id')

  const palette = await getAdminManagedPalette(paletteId)

  return toStoredPalette(palette, session.user.id)
})
