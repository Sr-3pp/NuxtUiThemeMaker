import { createError, createEvent, type H3Event } from 'h3'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const requireAuthSessionMock = vi.fn()
const sharePaletteWithUserMock = vi.fn()
const unsharePaletteWithUserMock = vi.fn()

vi.mock('~~/server/utils/auth-session', () => ({
  requireAuthSession: requireAuthSessionMock,
}))

vi.mock('~~/server/services/palette-service', () => ({
  sharePaletteWithUser: sharePaletteWithUserMock,
  unsharePaletteWithUser: unsharePaletteWithUserMock,
}))

function createSharePostEvent(body: Record<string, unknown>) {
  const req = {
    method: 'POST',
    url: '/api/palettes/palette-1/share',
    headers: {
      'content-type': 'application/json',
    },
    body,
  }
  const res = {
    writableEnded: false,
    headersSent: false,
  }
  const event = createEvent(req as never, res as never)
  event.context.params = { id: 'palette-1' }
  return event
}

function createShareDeleteEvent() {
  const req = {
    method: 'DELETE',
    url: '/api/palettes/palette-1/share/user-2',
    headers: {},
  }
  const res = {
    writableEnded: false,
    headersSent: false,
  }
  const event = createEvent(req as never, res as never)
  event.context.params = { id: 'palette-1', collaboratorUserId: 'user-2' }
  return event
}

describe('palette share api handlers', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    requireAuthSessionMock.mockReset()
    sharePaletteWithUserMock.mockReset()
    unsharePaletteWithUserMock.mockReset()
  })

  it('delegates sharing to the service for authenticated owners', async () => {
    requireAuthSessionMock.mockResolvedValueOnce({
      user: { id: 'user-1' },
    })
    sharePaletteWithUserMock.mockResolvedValueOnce({
      _id: 'palette-1',
    })

    const { default: handler } = await import('~~/server/api/palettes/[id]/share.post')
    const result = await handler(createSharePostEvent({
      email: 'designer@example.com',
    }) as H3Event)

    expect(sharePaletteWithUserMock).toHaveBeenCalledWith('palette-1', 'user-1', 'designer@example.com')
    expect(result).toEqual({ _id: 'palette-1' })
  })

  it('delegates unsharing to the service for authenticated owners', async () => {
    requireAuthSessionMock.mockResolvedValueOnce({
      user: { id: 'user-1' },
    })
    unsharePaletteWithUserMock.mockResolvedValueOnce({
      _id: 'palette-1',
    })

    const { default: handler } = await import('~~/server/api/palettes/[id]/share/[collaboratorUserId].delete')
    const result = await handler(createShareDeleteEvent() as H3Event)

    expect(unsharePaletteWithUserMock).toHaveBeenCalledWith('palette-1', 'user-1', 'user-2')
    expect(result).toEqual({ _id: 'palette-1' })
  })

  it('returns the auth error when unauthenticated', async () => {
    requireAuthSessionMock.mockRejectedValueOnce(createError({
      statusCode: 401,
      statusMessage: 'Authentication required',
    }))

    const { default: handler } = await import('~~/server/api/palettes/[id]/share.post')

    await expect(handler(createSharePostEvent({
      email: 'designer@example.com',
    }) as H3Event)).rejects.toMatchObject({
      statusCode: 401,
      statusMessage: 'Authentication required',
    })
  })
})
