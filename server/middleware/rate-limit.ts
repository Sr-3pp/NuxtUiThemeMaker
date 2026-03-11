import { enforceRateLimit } from '~~/server/utils/rate-limit'

export default defineEventHandler((event) => {
  if (!event.path.startsWith('/api/')) {
    return
  }

  enforceRateLimit(event)
})
