import { toNodeHandler } from 'better-auth/node'
import { getAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const auth = await getAuth()
  const handler = toNodeHandler(auth)

  await handler(event.node.req, event.node.res)
})
