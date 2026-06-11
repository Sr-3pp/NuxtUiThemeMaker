import { defineEventHandler } from 'h3'
import { listAdminPalettes } from '~~/server/db/repositories/admin/palettes-repository'
import { requireAdminSession } from '~~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)

  return listAdminPalettes()
})
