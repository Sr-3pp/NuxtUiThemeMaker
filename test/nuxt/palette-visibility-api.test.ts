import { createEvent, type H3Event } from 'h3'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const requireAuthSessionMock = vi.fn()
const getPaletteCollectionMock = vi.fn()
const parsePaletteObjectIdMock = vi.fn((id: string) => `object:${id}`)
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

vi.mock('~~/server/models/palette', () => ({
  getPaletteCollection: getPaletteCollectionMock,
  parsePaletteObjectId: parsePaletteObjectIdMock,
  toStoredPalette: toStoredPaletteMock,
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
  })

  it('returns the existing auth error when the request is unauthenticated', async () => {
    const authError = createError({
      statusCode: 401,
      statusMessage: 'Authentication required',
    })

    requireAuthSessionMock.mockRejectedValueOnce(authError)

    const { default: handler } = await import('~~/server/api/palettes/[id]/visibility/index.patch')

    await expect(handler(createPatchEvent('69af8b6940280b9bc83c3c07', { isPublic: true }) as H3Event))
      .rejects
      .toMatchObject({
        statusCode: 401,
        statusMessage: 'Authentication required',
      })
  })

  it('updates visibility for the palette owner', async () => {
    const originalPalette = {
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
      createdAt: new Date('2026-03-09T10:00:00.000Z'),
      updatedAt: new Date('2026-03-09T10:00:00.000Z'),
    }
    const updatedPalette = {
      ...originalPalette,
      isPublic: true,
      updatedAt: new Date('2026-03-10T10:00:00.000Z'),
    }
    const findOneMock = vi
      .fn()
      .mockResolvedValueOnce(originalPalette)
      .mockResolvedValueOnce(updatedPalette)
    const updateOneMock = vi.fn().mockResolvedValueOnce({ acknowledged: true })

    requireAuthSessionMock.mockResolvedValueOnce({
      user: { id: 'user-1' },
    })
    getPaletteCollectionMock.mockResolvedValueOnce({
      findOne: findOneMock,
      updateOne: updateOneMock,
    })

    const { default: handler } = await import('~~/server/api/palettes/[id]/visibility/index.patch')

    const result = await handler(createPatchEvent('69af8b6940280b9bc83c3c07', { isPublic: true }) as H3Event)

    expect(parsePaletteObjectIdMock).toHaveBeenCalledWith('69af8b6940280b9bc83c3c07')
    expect(findOneMock).toHaveBeenNthCalledWith(1, { _id: 'object:69af8b6940280b9bc83c3c07' })
    expect(updateOneMock).toHaveBeenCalledWith(
      { _id: 'palette-id' },
      {
        $set: {
          isPublic: true,
          updatedAt: expect.any(Date),
        },
      }
    )
    expect(findOneMock).toHaveBeenNthCalledWith(2, { _id: 'palette-id' })
    expect(result).toMatchObject({
      _id: 'palette-id',
      userId: 'user-1',
      slug: 'forest-glow',
      name: 'Forest Glow',
      isPublic: true,
    })
  })

  it('returns palette not found when the id does not exist', async () => {
    requireAuthSessionMock.mockResolvedValueOnce({
      user: { id: 'user-1' },
    })
    getPaletteCollectionMock.mockResolvedValueOnce({
      findOne: vi.fn().mockResolvedValueOnce(null),
      updateOne: vi.fn(),
    })

    const { default: handler } = await import('~~/server/api/palettes/[id]/visibility/index.patch')

    await expect(handler(createPatchEvent('69af8b6940280b9bc83c3c07', { isPublic: false }) as H3Event))
      .rejects
      .toMatchObject({
        statusCode: 404,
        statusMessage: 'Palette not found',
      })
  })
})
