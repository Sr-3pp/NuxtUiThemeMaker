import { beforeEach, describe, expect, it, vi } from 'vitest'

const getMongoDbMock = vi.fn()

vi.mock('~~/server/utils/mongodb', () => ({
  getMongoDb: getMongoDbMock,
}))

function createFindResult(documents: Record<string, unknown>[]) {
  const toArray = vi.fn().mockResolvedValue(documents)
  const sort = vi.fn().mockReturnValue({ toArray })
  const find = vi.fn().mockReturnValue({ sort })

  return { find, sort, toArray }
}

describe('user repository', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    getMongoDbMock.mockReset()
  })

  it('lists users from both supported auth collections and merges duplicate ids', async () => {
    const singularUsers = createFindResult([
      {
        id: 'user-1',
        name: 'Stale User',
        email: 'designer@example.com',
        aiPaletteGenerationsUsed: 0,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      },
    ])
    const pluralUsers = createFindResult([
      {
        id: 'user-1',
        name: 'Current User',
        aiPaletteGenerationsUsed: 1,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      },
      {
        id: 'user-2',
        name: 'Second User',
        aiPaletteGenerationsUsed: 0,
        createdAt: new Date('2026-01-02T00:00:00.000Z'),
      },
    ])

    getMongoDbMock.mockResolvedValueOnce({
      collection: vi.fn((name: string) => name === 'user' ? singularUsers : pluralUsers),
    })

    const { listUserDocuments } = await import('~~/server/db/repositories/user-repository')
    const users = await listUserDocuments({ sort: { createdAt: -1 } })

    expect(users).toHaveLength(2)
    expect(users[0]).toMatchObject({ id: 'user-2', name: 'Second User' })
    expect(users[1]).toMatchObject({
      id: 'user-1',
      name: 'Current User',
      email: 'designer@example.com',
      aiPaletteGenerationsUsed: 1,
    })
  })

  it('increments AI usage for matching users in both supported auth collections', async () => {
    const singularFindOneAndUpdate = vi.fn().mockResolvedValue({
      id: 'user-1',
      aiPaletteGenerationsUsed: 1,
    })
    const pluralFindOneAndUpdate = vi.fn().mockResolvedValue({
      id: 'user-1',
      aiPaletteGenerationsUsed: 1,
    })

    getMongoDbMock.mockResolvedValueOnce({
      collection: vi.fn((name: string) => ({
        findOneAndUpdate: name === 'user' ? singularFindOneAndUpdate : pluralFindOneAndUpdate,
      })),
    })

    const { incrementAiPaletteGenerationsUsed } = await import('~~/server/db/repositories/user-repository')
    const updatedUser = await incrementAiPaletteGenerationsUsed('user-1')

    expect(singularFindOneAndUpdate).toHaveBeenCalledOnce()
    expect(pluralFindOneAndUpdate).toHaveBeenCalledOnce()
    expect(singularFindOneAndUpdate).toHaveBeenCalledWith(
      { $or: expect.arrayContaining([{ id: 'user-1' }]) },
      { $inc: { aiPaletteGenerationsUsed: 1 } },
      { returnDocument: 'after' },
    )
    expect(updatedUser).toMatchObject({
      id: 'user-1',
      aiPaletteGenerationsUsed: 1,
    })
  })
})
