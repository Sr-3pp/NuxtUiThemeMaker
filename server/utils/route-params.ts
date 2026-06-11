import { createError, getRouterParam } from 'h3'
import type { H3Event } from 'h3'

export function requireRouterParam(event: H3Event, name: string, label = name) {
  const value = getRouterParam(event, name)

  if (!value) {
    throw createError({
      statusCode: 400,
      statusMessage: `Missing ${label}`,
    })
  }

  return value
}
