import { createError, createEvent, type H3Event } from 'h3'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const requireAuthSessionMock = vi.fn()
const setPaletteVisibilityForUserMock = vi.fn()

vi.mock('~~/server/utils/auth-session', () => ({
  requireAuthSession: requireAuthSessionMock,
}))

vi.mock('~~/server/services/palette-service', () => ({
  setPaletteVisibilityForUser: setPaletteVisibilityForUserMock,
}))

function createPatchEvent(id: string, body: Record<string, unknown>) {
  const req = {
    method: 'PATCH',
    url: `/api/palettes/${id}/visibility`,
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

  event.context.params = { id }

  return event
}

describe('palette visibility api handler', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    requireAuthSessionMock.mockReset()
    setPaletteVisibilityForUserMock.mockReset()
  })

  it('returns the existing auth error when the request is unauthenticated', async () => {
    const authError = createError({
      statusCode: 401,
      statusMessage: 'Authentication required',
    })

    requireAuthSessionMock.mockRejectedValueOnce(authError)

    const { default: handler } = await import('~~/server/api/palettes/[id]/visibility.patch')

    await expect(handler(createPatchEvent('69af8b6940280b9bc83c3c07', { isPublic: true }) as H3Event))
      .rejects
      .toMatchObject({
        statusCode: 401,
        statusMessage: 'Authentication required',
      })
  })

  it('delegates visibility updates to the service for the palette owner', async () => {
    setPaletteVisibilityForUserMock.mockResolvedValueOnce({
      _id: 'palette-id',
      userId: 'user-1',
      slug: 'forest-glow',
      name: 'Forest Glow',
      palette: {
        name: 'Forest Glow',
        modes: {
          light: {},
          dark: {},
        },
      },
      isPublic: true,
      createdAt: '2026-03-09T10:00:00.000Z',
      updatedAt: '2026-03-10T10:00:00.000Z',
    })
    requireAuthSessionMock.mockResolvedValueOnce({
      user: { id: 'user-1' },
    })

    const { default: handler } = await import('~~/server/api/palettes/[id]/visibility.patch')

    const result = await handler(createPatchEvent('69af8b6940280b9bc83c3c07', { isPublic: true }) as H3Event)

    expect(setPaletteVisibilityForUserMock).toHaveBeenCalledWith(
      '69af8b6940280b9bc83c3c07',
      'user-1',
      true
    )
    expect(result).toMatchObject({
      _id: 'palette-id',
      userId: 'user-1',
      slug: 'forest-glow',
      name: 'Forest Glow',
      isPublic: true,
    })
  })

  it('returns palette not found when the service cannot resolve the id', async () => {
    requireAuthSessionMock.mockResolvedValueOnce({
      user: { id: 'user-1' },
    })
    setPaletteVisibilityForUserMock.mockRejectedValueOnce(createError({
      statusCode: 404,
      statusMessage: 'Palette not found',
    }))

    const { default: handler } = await import('~~/server/api/palettes/[id]/visibility.patch')

    await expect(handler(createPatchEvent('69af8b6940280b9bc83c3c07', { isPublic: false }) as H3Event))
      .rejects
      .toMatchObject({
        statusCode: 404,
        statusMessage: 'Palette not found',
      })
  })
})
