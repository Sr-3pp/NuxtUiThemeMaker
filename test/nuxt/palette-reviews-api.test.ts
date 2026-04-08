import { createError, createEvent, type H3Event } from 'h3'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const createPaletteReviewForUserMock = vi.fn()
const getOptionalAuthSessionMock = vi.fn()
const listPaletteReviewsForViewerMock = vi.fn()
const requireAuthSessionMock = vi.fn()

vi.mock('~~/server/utils/auth-session', () => ({
  getOptionalAuthSession: getOptionalAuthSessionMock,
  requireAuthSession: requireAuthSessionMock,
}))

vi.mock('~~/server/services/palette-review-service', () => ({
  createPaletteReviewForUser: createPaletteReviewForUserMock,
  listPaletteReviewsForViewer: listPaletteReviewsForViewerMock,
}))

function createGetEvent() {
  const req = {
    method: 'GET',
    url: '/api/palettes/palette-1/reviews',
    headers: {},
  }
  const res = {
    writableEnded: false,
    headersSent: false,
  }
  const event = createEvent(req as never, res as never)
  event.context.params = { id: 'palette-1' }
  return event
}

function createPostEvent(body: Record<string, unknown>) {
  const req = {
    method: 'POST',
    url: '/api/palettes/palette-1/reviews',
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

describe('palette reviews api handlers', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    createPaletteReviewForUserMock.mockReset()
    getOptionalAuthSessionMock.mockReset()
    listPaletteReviewsForViewerMock.mockReset()
    requireAuthSessionMock.mockReset()
  })

  it('returns review threads for public viewers', async () => {
    getOptionalAuthSessionMock.mockResolvedValueOnce(null)
    listPaletteReviewsForViewerMock.mockResolvedValueOnce({
      summary: {
        total: 1,
        approvals: 1,
        comments: 0,
        changesRequested: 0,
      },
      reviews: [],
    })

    const { default: handler } = await import('~~/server/api/palettes/[id]/reviews.get')
    const result = await handler(createGetEvent() as H3Event)

    expect(listPaletteReviewsForViewerMock).toHaveBeenCalledWith('palette-1', null)
    expect(result).toMatchObject({
      summary: {
        approvals: 1,
      },
    })
  })

  it('requires authentication to create a review', async () => {
    requireAuthSessionMock.mockRejectedValueOnce(createError({
      statusCode: 401,
      statusMessage: 'Authentication required',
    }))

    const { default: handler } = await import('~~/server/api/palettes/[id]/reviews.post')

    await expect(handler(createPostEvent({
      status: 'commented',
      message: 'Looks good',
    }) as H3Event)).rejects.toMatchObject({
      statusCode: 401,
      statusMessage: 'Authentication required',
    })
  })

  it('delegates review creation for authenticated users', async () => {
    requireAuthSessionMock.mockResolvedValueOnce({
      user: {
        id: 'user-1',
        name: 'Taylor',
      },
    })
    createPaletteReviewForUserMock.mockResolvedValueOnce({
      id: 'review-1',
      status: 'approved',
      message: 'Ready to publish.',
    })

    const { default: handler } = await import('~~/server/api/palettes/[id]/reviews.post')
    const result = await handler(createPostEvent({
      status: 'approved',
      message: 'Ready to publish.',
    }) as H3Event)

    expect(createPaletteReviewForUserMock).toHaveBeenCalledWith('palette-1', {
      id: 'user-1',
      name: 'Taylor',
    }, {
      status: 'approved',
      message: 'Ready to publish.',
    })
    expect(result).toMatchObject({
      id: 'review-1',
      status: 'approved',
    })
  })
})
