import { beforeEach, describe, expect, it, vi } from 'vitest'

const countPalettesByUserIdMock = vi.fn()
const createPaletteMock = vi.fn()
const deletePaletteByIdMock = vi.fn()
const findPaletteByIdMock = vi.fn()
const generateUniquePaletteSlugMock = vi.fn()
const parsePaletteObjectIdMock = vi.fn((id: string) => `object:${id}`)
const updatePaletteByIdMock = vi.fn()
const normalizePaletteForStorageMock = vi.fn()
const toStoredPaletteMock = vi.fn()

vi.mock('h3', () => ({
  createError: (input: { statusCode: number, statusMessage: string }) =>
    Object.assign(new Error(input.statusMessage), input),
}))

vi.mock('~~/server/db/repositories/palette-repository', () => ({
  countPalettesByUserId: countPalettesByUserIdMock,
  createPalette: createPaletteMock,
  deletePaletteById: deletePaletteByIdMock,
  findPaletteById: findPaletteByIdMock,
  generateUniquePaletteSlug: generateUniquePaletteSlugMock,
  parsePaletteObjectId: parsePaletteObjectIdMock,
  updatePaletteById: updatePaletteByIdMock,
}))

vi.mock('~~/server/domain/palette', () => ({
  normalizePaletteForStorage: normalizePaletteForStorageMock,
  toStoredPalette: toStoredPaletteMock,
}))

describe('palette service', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    countPalettesByUserIdMock.mockReset()
    createPaletteMock.mockReset()
    deletePaletteByIdMock.mockReset()
    findPaletteByIdMock.mockReset()
    generateUniquePaletteSlugMock.mockReset()
    updatePaletteByIdMock.mockReset()
    normalizePaletteForStorageMock.mockReset()
    toStoredPaletteMock.mockReset()
  })

  it('blocks free users at the palette limit during create', async () => {
    countPalettesByUserIdMock.mockResolvedValueOnce(2)

    const { createPaletteForUser } = await import('../../server/services/palette-service')

    await expect(createPaletteForUser(
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
      }
    )).rejects.toMatchObject({
      statusCode: 403,
      statusMessage: 'Free plan users can only save 2 palettes',
    })

    expect(countPalettesByUserIdMock).toHaveBeenCalledWith('user-1')
    expect(createPaletteMock).not.toHaveBeenCalled()
  })

  it('creates a normalized palette for a user', async () => {
    const document = {
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
      createdAt: new Date('2026-03-15T12:00:00.000Z'),
      updatedAt: new Date('2026-03-15T12:00:00.000Z'),
    }
    const storedPalette = {
      _id: 'palette-id',
      userId: 'user-1',
      slug: 'forest-glow',
      name: 'Forest Glow',
      palette: document.palette,
      isPublic: false,
      createdAt: '2026-03-15T12:00:00.000Z',
      updatedAt: '2026-03-15T12:00:00.000Z',
    }

    generateUniquePaletteSlugMock.mockResolvedValueOnce('forest-glow')
    normalizePaletteForStorageMock.mockImplementationOnce((name, palette) => ({
      ...palette,
      name,
    }))
    createPaletteMock.mockResolvedValueOnce(document)
    toStoredPaletteMock.mockReturnValueOnce(storedPalette)

    const { createPaletteForUser } = await import('../../server/services/palette-service')

    const result = await createPaletteForUser(
      { id: 'user-1', plan: 'pro' },
      {
        name: 'Forest Glow',
        palette: {
          name: 'Draft',
          modes: {
            light: {},
            dark: {},
          },
        },
        isPublic: false,
      }
    )

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
    expect(result).toEqual(storedPalette)
  })

  it('rejects visibility changes for a non-owner', async () => {
    findPaletteByIdMock.mockResolvedValueOnce({
      _id: 'palette-id',
      userId: 'user-2',
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
    })

    const { setPaletteVisibilityForUser } = await import('../../server/services/palette-service')

    await expect(setPaletteVisibilityForUser('69af8b6940280b9bc83c3c07', 'user-1', true))
      .rejects
      .toMatchObject({
        statusCode: 403,
        statusMessage: 'Forbidden',
      })

    expect(parsePaletteObjectIdMock).toHaveBeenCalledWith('69af8b6940280b9bc83c3c07')
    expect(updatePaletteByIdMock).not.toHaveBeenCalled()
  })

  it('updates a palette for its owner and preserves visibility when omitted', async () => {
    const existingPalette = {
      _id: 'palette-id',
      userId: 'user-1',
      slug: 'old-slug',
      name: 'Forest Glow',
      palette: {
        name: 'Forest Glow',
        modes: {
          light: {},
          dark: {},
        },
      },
      isPublic: true,
      createdAt: new Date('2026-03-09T10:00:00.000Z'),
      updatedAt: new Date('2026-03-09T10:00:00.000Z'),
    }
    const updatedPalette = {
      ...existingPalette,
      slug: 'aurora',
      name: 'Aurora',
      updatedAt: new Date('2026-03-10T10:00:00.000Z'),
    }
    const storedPalette = {
      _id: 'palette-id',
      userId: 'user-1',
      slug: 'aurora',
      name: 'Aurora',
      palette: {
        name: 'Aurora',
        modes: {
          light: {},
          dark: {},
        },
      },
      isPublic: true,
      createdAt: '2026-03-09T10:00:00.000Z',
      updatedAt: '2026-03-10T10:00:00.000Z',
    }

    findPaletteByIdMock.mockResolvedValueOnce(existingPalette)
    generateUniquePaletteSlugMock.mockResolvedValueOnce('aurora')
    normalizePaletteForStorageMock.mockImplementationOnce((name, palette) => ({
      ...palette,
      name,
    }))
    updatePaletteByIdMock.mockResolvedValueOnce(updatedPalette)
    toStoredPaletteMock.mockReturnValueOnce(storedPalette)

    const { updatePaletteForUser } = await import('../../server/services/palette-service')

    const result = await updatePaletteForUser('69af8b6940280b9bc83c3c07', 'user-1', {
      name: 'Aurora',
      palette: {
        name: 'Draft',
        modes: {
          light: {},
          dark: {},
        },
      },
    })

    expect(generateUniquePaletteSlugMock).toHaveBeenCalledWith('Aurora', 'palette-id')
    expect(updatePaletteByIdMock).toHaveBeenCalledWith('palette-id', {
      slug: 'aurora',
      name: 'Aurora',
      palette: {
        name: 'Aurora',
        modes: {
          light: {},
          dark: {},
        },
      },
      isPublic: true,
      updatedAt: expect.any(Date),
    })
    expect(result).toEqual(storedPalette)
  })

  it('throws when an owned palette cannot be found', async () => {
    findPaletteByIdMock.mockResolvedValueOnce(null)

    const { getOwnedPaletteByIdOrThrow } = await import('../../server/services/palette-service')

    await expect(getOwnedPaletteByIdOrThrow('69af8b6940280b9bc83c3c07', 'user-1'))
      .rejects
      .toMatchObject({
        statusCode: 404,
        statusMessage: 'Palette not found',
      })
  })

  it('deletes an owned palette', async () => {
    findPaletteByIdMock.mockResolvedValueOnce({
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
    })

    const { deletePaletteForUser } = await import('../../server/services/palette-service')

    await deletePaletteForUser('69af8b6940280b9bc83c3c07', 'user-1')

    expect(deletePaletteByIdMock).toHaveBeenCalledWith('palette-id')
  })
})
