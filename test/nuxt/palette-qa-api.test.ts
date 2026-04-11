import { createError, createEvent, type H3Event } from 'h3'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const requireAuthSessionMock = vi.fn()
const getPaletteQaReportForUserMock = vi.fn()

vi.mock('~~/server/utils/auth-session', () => ({
  requireAuthSession: requireAuthSessionMock,
}))

vi.mock('~~/server/services/palette-qa-service', () => ({
  getPaletteQaReportForUser: getPaletteQaReportForUserMock,
}))

function createGetEvent(id: string) {
  const req = {
    method: 'GET',
    url: `/api/palettes/${id}/qa`,
  }
  const res = {
    writableEnded: false,
    headersSent: false,
  }
  const event = createEvent(req as never, res as never)

  event.context.params = { id }

  return event
}

describe('palette QA api handler', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    requireAuthSessionMock.mockReset()
    getPaletteQaReportForUserMock.mockReset()
  })

  it('returns the existing auth error when unauthenticated', async () => {
    requireAuthSessionMock.mockRejectedValueOnce(createError({
      statusCode: 401,
      statusMessage: 'Authentication required',
    }))

    const { default: handler } = await import('~~/server/api/palettes/[id]/qa.get')

    await expect(handler(createGetEvent('69af8b6940280b9bc83c3c07') as H3Event)).rejects.toMatchObject({
      statusCode: 401,
      statusMessage: 'Authentication required',
    })
  })

  it('returns QA for the palette owner', async () => {
    requireAuthSessionMock.mockResolvedValueOnce({
      user: { id: 'user-1' },
    })
    getPaletteQaReportForUserMock.mockResolvedValueOnce({
      paletteId: 'palette-id',
      report: {
        score: 88,
        status: 'healthy',
        issues: [],
        readiness: [],
        counts: {
          critical: 0,
          warning: 0,
          info: 0,
        },
      },
    })

    const { default: handler } = await import('~~/server/api/palettes/[id]/qa.get')

    const result = await handler(createGetEvent('69af8b6940280b9bc83c3c07') as H3Event)

    expect(getPaletteQaReportForUserMock).toHaveBeenCalledWith('69af8b6940280b9bc83c3c07', 'user-1')
    expect(result).toMatchObject({
      paletteId: 'palette-id',
      report: {
        score: 88,
        status: 'healthy',
      },
    })
  })

  it('returns forbidden when the user does not own the palette', async () => {
    requireAuthSessionMock.mockResolvedValueOnce({
      user: { id: 'user-1' },
    })
    getPaletteQaReportForUserMock.mockRejectedValueOnce(createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
    }))

    const { default: handler } = await import('~~/server/api/palettes/[id]/qa.get')

    await expect(handler(createGetEvent('69af8b6940280b9bc83c3c07') as H3Event)).rejects.toMatchObject({
      statusCode: 403,
      statusMessage: 'Forbidden',
    })
  })
})
