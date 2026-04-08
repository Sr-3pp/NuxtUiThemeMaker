import { createError, createEvent, type H3Event } from 'h3'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const requireAuthSessionMock = vi.fn()
const listPaletteHistoryForUserMock = vi.fn()
const toPaletteVersionSnapshotMock = vi.fn((value) => value)

vi.mock('~~/server/utils/auth-session', () => ({
  requireAuthSession: requireAuthSessionMock,
}))

vi.mock('~~/server/services/palette-service', () => ({
  listPaletteHistoryForUser: listPaletteHistoryForUserMock,
}))

vi.mock('~~/server/domain/palette', () => ({
  toPaletteVersionSnapshot: toPaletteVersionSnapshotMock,
}))

function createGetEvent(id: string) {
  const req = {
    method: 'GET',
    url: `/api/palettes/${id}/history`,
  }
  const res = {
    writableEnded: false,
    headersSent: false,
  }
  const event = createEvent(req as never, res as never)
  event.context.params = { id }
  return event
}

describe('palette history api handler', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    requireAuthSessionMock.mockReset()
    listPaletteHistoryForUserMock.mockReset()
    toPaletteVersionSnapshotMock.mockReset()
    toPaletteVersionSnapshotMock.mockImplementation((value) => value)
  })

  it('returns the auth error when unauthenticated', async () => {
    requireAuthSessionMock.mockRejectedValueOnce(createError({
      statusCode: 401,
      statusMessage: 'Authentication required',
    }))

    const { default: handler } = await import('~~/server/api/palettes/[id]/history.get')

    await expect(handler(createGetEvent('palette-id') as H3Event)).rejects.toMatchObject({
      statusCode: 401,
      statusMessage: 'Authentication required',
    })
  })

  it('returns history for the owner', async () => {
    requireAuthSessionMock.mockResolvedValueOnce({
      user: { id: 'user-1' },
    })
    listPaletteHistoryForUserMock.mockResolvedValueOnce([
      { _id: 'version-1', version: 2 },
    ])

    const { default: handler } = await import('~~/server/api/palettes/[id]/history.get')

    const result = await handler(createGetEvent('palette-id') as H3Event)

    expect(listPaletteHistoryForUserMock).toHaveBeenCalledWith('palette-id', 'user-1')
    expect(toPaletteVersionSnapshotMock).toHaveBeenNthCalledWith(
      1,
      { _id: 'version-1', version: 2 },
      0,
      [{ _id: 'version-1', version: 2 }],
    )
    expect(result).toEqual([{ _id: 'version-1', version: 2 }])
  })
})
