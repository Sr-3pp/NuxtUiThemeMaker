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
const assertPalettePublishReadyMock = vi.fn()

vi.mock('h3', () => ({
  createError: (input: { statusCode: number, statusMessage: string }) =>
    Object.assign(new Error(input.statusMessage), input),
}))

vi.mock('~~/server/db/repositories/palette-repository', () => ({
  countPalettesByUserId: countPalettesByUserIdMock,
  createPalette: createPaletteMock,
  deletePaletteById: deletePaletteByIdMock,
  findPaletteById: findPaletteByIdMock,
  updatePaletteById: updatePaletteByIdMock,
}))

vi.mock('~~/server/domain/palette', () => ({
  normalizePaletteForStorage: normalizePaletteForStorageMock,
  toStoredPalette: toStoredPaletteMock,
}))

vi.mock('~~/server/services/palette-helpers', () => ({
  generateUniquePaletteSlug: generateUniquePaletteSlugMock,
  parsePaletteObjectId: parsePaletteObjectIdMock,
}))

vi.mock('~~/server/services/palette-qa-service', () => ({
  assertPalettePublishReady: assertPalettePublishReadyMock,
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
    assertPalettePublishReadyMock.mockReset()
  })

  it('blocks free users at the palette limit during create', async () => {
    countPalettesByUserIdMock.mockResolvedValueOnce(1)

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
      statusMessage: 'Free plan users can only save 1 palette',
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
    expect(assertPalettePublishReadyMock).not.toHaveBeenCalled()
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

  it('allows admin users to create palettes without applying save limits', async () => {
    const document = {
      _id: 'palette-id',
      userId: 'admin-1',
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
      userId: 'admin-1',
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
      { id: 'admin-1', plan: 'free', isAdmin: true },
      {
        name: 'Forest Glow',
        palette: {
          name: 'Draft',
          modes: {
            light: {},
            dark: {},
          },
        },
      }
    )

    expect(countPalettesByUserIdMock).not.toHaveBeenCalled()
    expect(result).toEqual(storedPalette)
  })

  it('checks publish readiness before creating a public palette', async () => {
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
      isPublic: true,
      createdAt: new Date('2026-03-15T12:00:00.000Z'),
      updatedAt: new Date('2026-03-15T12:00:00.000Z'),
    }

    generateUniquePaletteSlugMock.mockResolvedValueOnce('forest-glow')
    normalizePaletteForStorageMock.mockImplementationOnce((name, palette) => ({
      ...palette,
      name,
    }))
    createPaletteMock.mockResolvedValueOnce(document)
    toStoredPaletteMock.mockReturnValueOnce({
      _id: 'palette-id',
      userId: 'user-1',
      slug: 'forest-glow',
      name: 'Forest Glow',
      palette: document.palette,
      isPublic: true,
      createdAt: '2026-03-15T12:00:00.000Z',
      updatedAt: '2026-03-15T12:00:00.000Z',
    })

    const { createPaletteForUser } = await import('../../server/services/palette-service')

    await createPaletteForUser(
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
        isPublic: true,
      }
    )

    expect(assertPalettePublishReadyMock).toHaveBeenCalledWith({
      name: 'Forest Glow',
      modes: {
        light: {},
        dark: {},
      },
    })
  })

  it('blocks pro users at the palette limit during create', async () => {
    countPalettesByUserIdMock.mockResolvedValueOnce(20)

    const { createPaletteForUser } = await import('../../server/services/palette-service')

    await expect(createPaletteForUser(
      { id: 'user-1', plan: 'pro' },
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
      statusMessage: 'Pro users can only save 20 palettes',
    })
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
    expect(assertPalettePublishReadyMock).not.toHaveBeenCalled()
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

  it('checks publish readiness before updating a public palette', async () => {
    findPaletteByIdMock.mockResolvedValueOnce({
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
      isPublic: false,
      createdAt: new Date('2026-03-09T10:00:00.000Z'),
      updatedAt: new Date('2026-03-09T10:00:00.000Z'),
    })
    generateUniquePaletteSlugMock.mockResolvedValueOnce('aurora')
    normalizePaletteForStorageMock.mockImplementationOnce((name, palette) => ({
      ...palette,
      name,
    }))
    updatePaletteByIdMock.mockResolvedValueOnce({
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
      createdAt: new Date('2026-03-09T10:00:00.000Z'),
      updatedAt: new Date('2026-03-10T10:00:00.000Z'),
    })
    toStoredPaletteMock.mockReturnValueOnce({
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
    })

    const { updatePaletteForUser } = await import('../../server/services/palette-service')

    await updatePaletteForUser('69af8b6940280b9bc83c3c07', 'user-1', {
      name: 'Aurora',
      palette: {
        name: 'Draft',
        modes: {
          light: {},
          dark: {},
        },
      },
      isPublic: true,
    })

    expect(assertPalettePublishReadyMock).toHaveBeenCalledWith({
      name: 'Aurora',
      modes: {
        light: {},
        dark: {},
      },
    })
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

  it('checks publish readiness before making a palette public', async () => {
    const existingPalette = {
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

    findPaletteByIdMock.mockResolvedValueOnce(existingPalette)
    updatePaletteByIdMock.mockResolvedValueOnce({
      ...existingPalette,
      isPublic: true,
      updatedAt: new Date('2026-03-10T10:00:00.000Z'),
    })
    toStoredPaletteMock.mockReturnValueOnce({
      _id: 'palette-id',
      userId: 'user-1',
      slug: 'forest-glow',
      name: 'Forest Glow',
      palette: existingPalette.palette,
      isPublic: true,
      createdAt: '2026-03-09T10:00:00.000Z',
      updatedAt: '2026-03-10T10:00:00.000Z',
    })

    const { setPaletteVisibilityForUser } = await import('../../server/services/palette-service')

    await setPaletteVisibilityForUser('69af8b6940280b9bc83c3c07', 'user-1', true)

    expect(assertPalettePublishReadyMock).toHaveBeenCalledWith(existingPalette.palette)
  })
})
