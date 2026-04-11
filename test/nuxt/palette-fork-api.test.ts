import { createError, createEvent, type H3Event } from 'h3'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const requireAuthSessionMock = vi.fn()
const forkPaletteForUserMock = vi.fn()

vi.mock('~~/server/utils/auth-session', () => ({
  requireAuthSession: requireAuthSessionMock,
}))

vi.mock('~~/server/services/palette-service', () => ({
  forkPaletteForUser: forkPaletteForUserMock,
}))

function createForkEvent() {
  const req = {
    method: 'POST',
    url: '/api/palettes/palette-1/fork',
    headers: {},
  }
  const res = {
    writableEnded: false,
    headersSent: false,
  }

  return createEvent(req as never, res as never)
}

describe('palette fork api handler', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    requireAuthSessionMock.mockReset()
    forkPaletteForUserMock.mockReset()
  })

  it('returns the auth error when unauthenticated', async () => {
    requireAuthSessionMock.mockRejectedValueOnce(createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    }))

    const { default: handler } = await import('~~/server/api/palettes/[id]/fork.post')

    await expect(handler(createForkEvent() as H3Event)).rejects.toMatchObject({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  })

  it('delegates forking to the service for authenticated users', async () => {
    requireAuthSessionMock.mockResolvedValueOnce({
      user: { id: 'user-1', plan: 'pro', isAdmin: false },
    })
    forkPaletteForUserMock.mockResolvedValueOnce({
      _id: 'fork-palette-id',
      name: 'Forest Glow Fork',
      forkedFrom: {
        paletteId: 'palette-1',
        userId: 'user-2',
        slug: 'forest-glow',
        name: 'Forest Glow',
        version: 3,
      },
    })

    const { default: handler } = await import('~~/server/api/palettes/[id]/fork.post')
    const event = createForkEvent() as H3Event
    event.context.params = { id: 'palette-1' }

    const result = await handler(event)

    expect(forkPaletteForUserMock).toHaveBeenCalledWith('palette-1', {
      id: 'user-1',
      plan: 'pro',
      isAdmin: false,
    })
    expect(result).toMatchObject({
      _id: 'fork-palette-id',
      name: 'Forest Glow Fork',
    })
  })
})
