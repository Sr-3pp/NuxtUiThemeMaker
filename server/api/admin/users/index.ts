import { defineEventHandler } from 'h3'
import { listAdminUsers } from '~~/server/db/repositories/admin/users-repository'
import { requireAdminSession } from '~~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)

  return listAdminUsers()
})
