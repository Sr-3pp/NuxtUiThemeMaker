import { beforeEach, describe, expect, it, vi } from 'vitest'

const createPaletteReviewMock = vi.fn()
const findPaletteByIdMock = vi.fn()
const listPaletteReviewsByPaletteIdMock = vi.fn()
const parsePaletteObjectIdMock = vi.fn((id: string) => `object:${id}`)

vi.mock('h3', () => ({
  createError: (input: { statusCode: number, statusMessage: string }) =>
    Object.assign(new Error(input.statusMessage), input),
}))

vi.mock('~~/server/db/repositories/palette-repository', () => ({
  findPaletteById: findPaletteByIdMock,
}))

vi.mock('~~/server/db/repositories/palette-review-repository', () => ({
  createPaletteReview: createPaletteReviewMock,
  listPaletteReviewsByPaletteId: listPaletteReviewsByPaletteIdMock,
}))

vi.mock('~~/server/services/palette-helpers', () => ({
  parsePaletteObjectId: parsePaletteObjectIdMock,
}))

describe('palette review service', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    createPaletteReviewMock.mockReset()
    findPaletteByIdMock.mockReset()
    listPaletteReviewsByPaletteIdMock.mockReset()
    parsePaletteObjectIdMock.mockReset()
    parsePaletteObjectIdMock.mockImplementation((id: string) => `object:${id}`)
  })

  it('lists review threads for public palettes', async () => {
    findPaletteByIdMock.mockResolvedValueOnce({
      _id: 'palette-id',
      userId: 'owner-1',
      isPublic: true,
    })
    listPaletteReviewsByPaletteIdMock.mockResolvedValueOnce([
      {
        _id: { toHexString: () => 'review-1' },
        paletteId: { toHexString: () => 'palette-id' },
        userId: 'user-2',
        userName: 'Taylor',
        status: 'approved',
        message: 'Looks solid.',
        createdAt: new Date('2026-04-07T12:00:00.000Z'),
      },
      {
        _id: { toHexString: () => 'review-2' },
        paletteId: { toHexString: () => 'palette-id' },
        userId: 'user-3',
        userName: 'Jordan',
        status: 'changes_requested',
        message: 'Needs stronger warning contrast.',
        createdAt: new Date('2026-04-07T11:00:00.000Z'),
      },
    ])

    const { listPaletteReviewsForViewer } = await import('../../server/services/palette-review-service')
    const result = await listPaletteReviewsForViewer('palette-1', null)

    expect(result.summary).toEqual({
      total: 2,
      approvals: 1,
      comments: 0,
      changesRequested: 1,
    })
    expect(result.reviews[0]).toMatchObject({
      id: 'review-1',
      userName: 'Taylor',
      status: 'approved',
    })
  })

  it('blocks non-owners from reviewing private palettes', async () => {
    findPaletteByIdMock.mockResolvedValueOnce({
      _id: 'palette-id',
      userId: 'owner-1',
      isPublic: false,
    })

    const { createPaletteReviewForUser } = await import('../../server/services/palette-review-service')

    await expect(createPaletteReviewForUser('palette-1', {
      id: 'user-2',
      name: 'Taylor',
    }, {
      status: 'commented',
      message: 'Private feedback',
    })).rejects.toMatchObject({
      statusCode: 404,
      statusMessage: 'Palette not found',
    })
  })

  it('creates reviews for accessible palettes', async () => {
    findPaletteByIdMock.mockResolvedValueOnce({
      _id: 'palette-id',
      userId: 'owner-1',
      isPublic: true,
    })
    createPaletteReviewMock.mockResolvedValueOnce({
      _id: { toHexString: () => 'review-1' },
      paletteId: { toHexString: () => 'palette-id' },
      userId: 'user-2',
      userName: 'Taylor',
      status: 'commented',
      message: 'Great direction.',
      createdAt: new Date('2026-04-07T12:00:00.000Z'),
    })

    const { createPaletteReviewForUser } = await import('../../server/services/palette-review-service')
    const result = await createPaletteReviewForUser('palette-1', {
      id: 'user-2',
      name: 'Taylor',
    }, {
      status: 'commented',
      message: '  Great direction.  ',
    })

    expect(createPaletteReviewMock).toHaveBeenCalledWith(expect.objectContaining({
      paletteId: 'palette-id',
      userId: 'user-2',
      userName: 'Taylor',
      status: 'commented',
      message: 'Great direction.',
    }))
    expect(result).toMatchObject({
      id: 'review-1',
      message: 'Great direction.',
    })
  })
})
