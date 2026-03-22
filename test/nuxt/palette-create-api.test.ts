import { createError, createEvent, type H3Event } from 'h3'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const requireAuthSessionMock = vi.fn()
const createPaletteForUserMock = vi.fn()

vi.mock('~~/server/utils/auth-session', () => ({
  requireAuthSession: requireAuthSessionMock,
}))

vi.mock('~~/server/services/palette-service', () => ({
  createPaletteForUser: createPaletteForUserMock,
}))

function createPostEvent(body: Record<string, unknown>) {
  const req = {
    method: 'POST',
    url: '/api/palettes',
    headers: {
      'content-type': 'application/json',
    },
    body,
  }
  const res = {
    writableEnded: false,
    headersSent: false,
  }

  return createEvent(req as never, res as never)
}

describe('palette create api handler', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    requireAuthSessionMock.mockReset()
    createPaletteForUserMock.mockReset()
  })

  it('returns the existing service error for free plan users at the palette limit', async () => {
    requireAuthSessionMock.mockResolvedValueOnce({
      user: { id: 'user-1', plan: 'free' },
    })
    createPaletteForUserMock.mockRejectedValueOnce(createError({
      statusCode: 403,
      statusMessage: 'Free plan users can only save 1 palette',
    }))

    const { default: handler } = await import('~~/server/api/palettes/index.post')

    await expect(handler(createPostEvent({
      name: 'Forest Glow',
      palette: {
        name: 'Forest Glow',
        modes: {
          light: {},
          dark: {},
        },
      },
      isPublic: false,
    }) as H3Event)).rejects.toMatchObject({
      statusCode: 403,
      statusMessage: 'Free plan users can only save 1 palette',
    })

    expect(createPaletteForUserMock).toHaveBeenCalledWith(
      { id: 'user-1', plan: 'free' },
      {
        name: 'Forest Glow',
        palette: {
          name: 'Forest Glow',
          modes: {
            light: {},
            dark: {},
          },
        },
        isPublic: false,
      }
    )
  })

  it('delegates palette creation to the service for authenticated users', async () => {
    createPaletteForUserMock.mockResolvedValueOnce({
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
      isPublic: false,
      createdAt: '2026-03-15T12:00:00.000Z',
      updatedAt: '2026-03-15T12:00:00.000Z',
    })
    requireAuthSessionMock.mockResolvedValueOnce({
      user: { id: 'user-1', plan: 'pro' },
    })

    const { default: handler } = await import('~~/server/api/palettes/index.post')

    const result = await handler(createPostEvent({
      name: 'Forest Glow',
      palette: {
        name: 'Draft Name',
        modes: {
          light: {},
          dark: {},
        },
      },
      isPublic: false,
    }) as H3Event)

    expect(createPaletteForUserMock).toHaveBeenCalledWith(
      { id: 'user-1', plan: 'pro' },
      {
        name: 'Forest Glow',
        palette: {
          name: 'Draft Name',
          modes: {
            light: {},
            dark: {},
          },
        },
        isPublic: false,
      }
    )
    expect(result).toMatchObject({
      _id: 'palette-id',
      userId: 'user-1',
      slug: 'forest-glow',
      name: 'Forest Glow',
    })
  })
})
