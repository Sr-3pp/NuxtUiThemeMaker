import { ObjectId } from 'mongodb'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const getPaletteCollectionMock = vi.fn()
const listUserDocumentsMock = vi.fn()

vi.mock('~~/server/db/collections/palettes', () => ({
  getPaletteCollection: getPaletteCollectionMock,
}))

vi.mock('~~/server/db/repositories/user-repository', () => ({
  listUserDocuments: listUserDocumentsMock,
}))

function mockPaletteCollection(palettes: Record<string, unknown>[]) {
  const toArray = vi.fn().mockResolvedValue(palettes)
  const sort = vi.fn().mockReturnValue({ toArray })
  const find = vi.fn().mockReturnValue({ sort })

  getPaletteCollectionMock.mockResolvedValueOnce({ find })

  return {
    find,
    sort,
    toArray,
  }
}

function createPalette(overrides: Record<string, unknown> = {}) {
  return {
    _id: new ObjectId(),
    userId: 'user-1',
    slug: 'forest-glow',
    name: 'Forest Glow',
    isPublic: true,
    lifecycleStatus: 'published',
    version: 2,
    publishedAt: new Date('2026-01-02T00:00:00.000Z'),
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-03T00:00:00.000Z'),
    ...overrides,
  }
}

describe('admin palettes repository', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    getPaletteCollectionMock.mockReset()
    listUserDocumentsMock.mockReset()
  })

  it('enriches palette owners with user names', async () => {
    mockPaletteCollection([
      createPalette({
        userId: 'user-1',
      }),
    ])
    listUserDocumentsMock.mockResolvedValueOnce([
      {
        id: 'user-1',
        name: 'Casey Designer',
      },
    ])

    const { listAdminPalettes } = await import('~~/server/db/repositories/admin/palettes-repository')
    const palettes = await listAdminPalettes()

    expect(listUserDocumentsMock).toHaveBeenCalledWith(expect.objectContaining({
      projection: {
        _id: 1,
        id: 1,
        name: 1,
      },
    }))
    expect(palettes[0]).toMatchObject({
      userId: 'user-1',
      ownerName: 'Casey Designer',
      name: 'Forest Glow',
      lifecycleStatus: 'published',
    })
  })

  it('supports legacy owner ids stored as Mongo object id strings', async () => {
    const ownerId = new ObjectId()

    mockPaletteCollection([
      createPalette({
        userId: ownerId.toHexString(),
      }),
    ])
    listUserDocumentsMock.mockResolvedValueOnce([
      {
        _id: ownerId,
        name: 'Legacy Owner',
      },
    ])

    const { listAdminPalettes } = await import('~~/server/db/repositories/admin/palettes-repository')
    const palettes = await listAdminPalettes()

    expect(listUserDocumentsMock).toHaveBeenCalledWith(expect.objectContaining({
      filter: {
        $or: expect.arrayContaining([
          { id: { $in: [ownerId.toHexString()] } },
          { _id: { $in: [ownerId.toHexString()] } },
        ]),
      },
    }))
    expect(palettes[0]?.ownerName).toBe('Legacy Owner')
  })

  it('keeps the owner id as the frontend fallback when no user name is found', async () => {
    mockPaletteCollection([
      createPalette({
        userId: 'missing-user',
      }),
    ])
    listUserDocumentsMock.mockResolvedValueOnce([])

    const { listAdminPalettes } = await import('~~/server/db/repositories/admin/palettes-repository')
    const palettes = await listAdminPalettes()

    expect(palettes[0]).toMatchObject({
      userId: 'missing-user',
      ownerName: '',
    })
  })
})
