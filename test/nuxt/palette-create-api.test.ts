import { createEvent, type H3Event } from 'h3'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const requireAuthSessionMock = vi.fn()
const countPalettesByUserIdMock = vi.fn()
const createPaletteMock = vi.fn()
const generateUniquePaletteSlugMock = vi.fn()
const normalizePaletteForStorageMock = vi.fn()
const toStoredPaletteMock = vi.fn((palette: {
  _id: string
  userId: string
  slug: string
  name: string
  palette: { name: string, modes: { light: {}, dark: {} } }
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}) => ({
  _id: palette._id,
  userId: palette.userId,
  slug: palette.slug,
  name: palette.name,
  palette: palette.palette,
  isPublic: palette.isPublic,
  createdAt: palette.createdAt.toISOString(),
  updatedAt: palette.updatedAt.toISOString(),
}))

vi.mock('~~/server/utils/auth-session', () => ({
  requireAuthSession: requireAuthSessionMock,
}))

vi.mock('~~/server/db/repositories/palette-repository', () => ({
  countPalettesByUserId: countPalettesByUserIdMock,
  createPalette: createPaletteMock,
  generateUniquePaletteSlug: generateUniquePaletteSlugMock,
}))

vi.mock('~~/server/domain/palette', () => ({
  normalizePaletteForStorage: normalizePaletteForStorageMock,
  toStoredPalette: toStoredPaletteMock,
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
    countPalettesByUserIdMock.mockReset()
    createPaletteMock.mockReset()
    generateUniquePaletteSlugMock.mockReset()
    normalizePaletteForStorageMock.mockReset()
  })

  it('blocks free plan users once they already have 2 saved palettes', async () => {
    requireAuthSessionMock.mockResolvedValueOnce({
      user: { id: 'user-1', plan: 'free' },
    })
    countPalettesByUserIdMock.mockResolvedValueOnce(2)

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
      statusMessage: 'Free plan users can only save 2 palettes',
    })

    expect(countPalettesByUserIdMock).toHaveBeenCalledWith('user-1')
    expect(createPaletteMock).not.toHaveBeenCalled()
  })

  it('allows pro users to create palettes beyond the free tier limit', async () => {
    const createdAt = new Date('2026-03-15T12:00:00.000Z')
    const createdPalette = {
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
      createdAt,
      updatedAt: createdAt,
    }

    requireAuthSessionMock.mockResolvedValueOnce({
      user: { id: 'user-1', plan: 'pro' },
    })
    generateUniquePaletteSlugMock.mockResolvedValueOnce('forest-glow')
    normalizePaletteForStorageMock.mockImplementationOnce((name, palette) => ({
      ...palette,
      name,
    }))
    createPaletteMock.mockResolvedValueOnce(createdPalette)

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

    expect(countPalettesByUserIdMock).not.toHaveBeenCalled()
    expect(generateUniquePaletteSlugMock).toHaveBeenCalledWith('Forest Glow')
    expect(createPaletteMock).toHaveBeenCalledWith({
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
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })
    expect(result).toMatchObject({
      _id: 'palette-id',
      userId: 'user-1',
      slug: 'forest-glow',
      name: 'Forest Glow',
    })
  })
})
