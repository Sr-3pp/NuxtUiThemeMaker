import { beforeEach, describe, expect, it, vi } from 'vitest'

const countPalettesByUserIdMock = vi.fn()
const createPaletteMock = vi.fn()
const createPaletteVersionMock = vi.fn()
const deletePaletteByIdMock = vi.fn()
const findPaletteByIdMock = vi.fn()
const findUserByEmailMock = vi.fn()
const generateUniquePaletteSlugMock = vi.fn()
const getPaletteLifecycleStatusMock = vi.fn((isPublic: boolean) => isPublic ? 'published' : 'draft')
const listPaletteVersionsByPaletteIdMock = vi.fn()
const normalizePaletteForStorageMock = vi.fn()
const parsePaletteObjectIdMock = vi.fn((id: string) => `object:${id}`)
const toStoredPaletteMock = vi.fn()
const updatePaletteByIdMock = vi.fn()
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

vi.mock('~~/server/db/repositories/user-repository', () => ({
  findUserByEmail: findUserByEmailMock,
}))

vi.mock('~~/server/db/repositories/palette-version-repository', () => ({
  createPaletteVersion: createPaletteVersionMock,
  listPaletteVersionsByPaletteId: listPaletteVersionsByPaletteIdMock,
}))

vi.mock('~~/server/domain/palette', () => ({
  getPaletteLifecycleStatus: getPaletteLifecycleStatusMock,
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
    createPaletteVersionMock.mockReset()
    deletePaletteByIdMock.mockReset()
    findPaletteByIdMock.mockReset()
    findUserByEmailMock.mockReset()
    generateUniquePaletteSlugMock.mockReset()
    getPaletteLifecycleStatusMock.mockReset()
    listPaletteVersionsByPaletteIdMock.mockReset()
    normalizePaletteForStorageMock.mockReset()
    parsePaletteObjectIdMock.mockReset()
    toStoredPaletteMock.mockReset()
    updatePaletteByIdMock.mockReset()
    assertPalettePublishReadyMock.mockReset()

    getPaletteLifecycleStatusMock.mockImplementation((isPublic: boolean) => isPublic ? 'published' : 'draft')
    parsePaletteObjectIdMock.mockImplementation((id: string) => `object:${id}`)
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

    expect(createPaletteMock).not.toHaveBeenCalled()
  })

  it('creates a normalized draft palette and records version history', async () => {
    const document = {
      _id: 'palette-id',
      userId: 'user-1',
      slug: 'forest-glow',
      name: 'Forest Glow',
      palette: {
        name: 'Forest Glow',
        modes: { light: {}, dark: {} },
      },
      isPublic: false,
      lifecycleStatus: 'draft',
      version: 1,
      publishedAt: null,
      createdAt: new Date('2026-03-15T12:00:00.000Z'),
      updatedAt: new Date('2026-03-15T12:00:00.000Z'),
    }

    generateUniquePaletteSlugMock.mockResolvedValueOnce('forest-glow')
    normalizePaletteForStorageMock.mockImplementationOnce((name, palette) => ({ ...palette, name }))
    createPaletteMock.mockResolvedValueOnce(document)
    toStoredPaletteMock.mockReturnValueOnce({
      _id: 'palette-id',
      userId: 'user-1',
      slug: 'forest-glow',
      name: 'Forest Glow',
      palette: document.palette,
      isPublic: false,
      lifecycleStatus: 'draft',
      version: 1,
      publishedAt: null,
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
          modes: { light: {}, dark: {} },
        },
        isPublic: false,
      }
    )

    expect(createPaletteMock).toHaveBeenCalledWith(expect.objectContaining({
      isPublic: false,
      lifecycleStatus: 'draft',
      version: 1,
      publishedAt: null,
      forkedFrom: null,
    }))
    expect(createPaletteVersionMock).toHaveBeenCalledWith(expect.objectContaining({
      paletteId: 'palette-id',
      version: 1,
      event: 'created',
      lifecycleStatus: 'draft',
      isPublic: false,
    }))
  })

  it('checks readiness before creating a public palette', async () => {
    generateUniquePaletteSlugMock.mockResolvedValueOnce('forest-glow')
    normalizePaletteForStorageMock.mockImplementationOnce((name, palette) => ({ ...palette, name }))
    createPaletteMock.mockResolvedValueOnce({
      _id: 'palette-id',
      userId: 'user-1',
      slug: 'forest-glow',
      name: 'Forest Glow',
      palette: { name: 'Forest Glow', modes: { light: {}, dark: {} } },
      isPublic: true,
      lifecycleStatus: 'published',
      version: 1,
      publishedAt: new Date('2026-03-15T12:00:00.000Z'),
      createdAt: new Date('2026-03-15T12:00:00.000Z'),
      updatedAt: new Date('2026-03-15T12:00:00.000Z'),
    })
    toStoredPaletteMock.mockReturnValueOnce({})

    const { createPaletteForUser } = await import('../../server/services/palette-service')

    await createPaletteForUser(
      { id: 'user-1', plan: 'pro' },
      {
        name: 'Forest Glow',
        palette: {
          name: 'Draft',
          modes: { light: {}, dark: {} },
        },
        isPublic: true,
      }
    )

    expect(assertPalettePublishReadyMock).toHaveBeenCalledWith({
      name: 'Forest Glow',
      modes: { light: {}, dark: {} },
    })
    expect(createPaletteVersionMock).toHaveBeenCalledWith(expect.objectContaining({
      event: 'published',
      lifecycleStatus: 'published',
      isPublic: true,
    }))
  })

  it('forks a public palette into a private draft with provenance metadata', async () => {
    findPaletteByIdMock.mockResolvedValueOnce({
      _id: { toHexString: () => 'source-palette-id' },
      userId: 'user-2',
      slug: 'forest-glow',
      name: 'Forest Glow',
      palette: { name: 'Forest Glow', modes: { light: {}, dark: {} } },
      isPublic: true,
      lifecycleStatus: 'published',
      version: 3,
      publishedAt: new Date('2026-03-09T10:00:00.000Z'),
      forkedFrom: null,
      createdAt: new Date('2026-03-09T10:00:00.000Z'),
      updatedAt: new Date('2026-03-10T10:00:00.000Z'),
    })
    countPalettesByUserIdMock.mockResolvedValueOnce(0)
    generateUniquePaletteSlugMock.mockResolvedValueOnce('forest-glow-fork')
    normalizePaletteForStorageMock.mockImplementationOnce((name, palette) => ({ ...palette, name }))
    createPaletteMock.mockResolvedValueOnce({
      _id: 'fork-palette-id',
      userId: 'user-1',
      slug: 'forest-glow-fork',
      name: 'Forest Glow Fork',
      palette: { name: 'Forest Glow Fork', modes: { light: {}, dark: {} } },
      isPublic: false,
      lifecycleStatus: 'draft',
      version: 1,
      publishedAt: null,
      forkedFrom: {
        paletteId: 'source-palette-id',
        userId: 'user-2',
        slug: 'forest-glow',
        name: 'Forest Glow',
        version: 3,
      },
      createdAt: new Date('2026-03-15T12:00:00.000Z'),
      updatedAt: new Date('2026-03-15T12:00:00.000Z'),
    })
    toStoredPaletteMock.mockReturnValueOnce({
      _id: 'fork-palette-id',
      forkedFrom: {
        paletteId: 'source-palette-id',
        userId: 'user-2',
        slug: 'forest-glow',
        name: 'Forest Glow',
        version: 3,
      },
    })

    const { forkPaletteForUser } = await import('../../server/services/palette-service')

    const result = await forkPaletteForUser('69af8b6940280b9bc83c3c07', {
      id: 'user-1',
      plan: 'pro',
    })

    expect(createPaletteMock).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Forest Glow Fork',
      isPublic: false,
      forkedFrom: {
        paletteId: 'source-palette-id',
        userId: 'user-2',
        slug: 'forest-glow',
        name: 'Forest Glow',
        version: 3,
      },
    }))
    expect(createPaletteVersionMock).toHaveBeenCalledWith(expect.objectContaining({
      event: 'created',
      isPublic: false,
      lifecycleStatus: 'draft',
    }))
    expect(result).toEqual({
      _id: 'fork-palette-id',
      forkedFrom: {
        paletteId: 'source-palette-id',
        userId: 'user-2',
        slug: 'forest-glow',
        name: 'Forest Glow',
        version: 3,
      },
    })
  })

  it('shares a palette with another registered user', async () => {
    findPaletteByIdMock.mockResolvedValueOnce({
      _id: 'palette-id',
      userId: 'user-1',
      slug: 'forest-glow',
      name: 'Forest Glow',
      palette: { name: 'Forest Glow', modes: { light: {}, dark: {} } },
      isPublic: false,
      lifecycleStatus: 'draft',
      version: 2,
      publishedAt: null,
      forkedFrom: null,
      collaborators: [],
      createdAt: new Date('2026-03-09T10:00:00.000Z'),
      updatedAt: new Date('2026-03-10T10:00:00.000Z'),
    })
    findUserByEmailMock.mockResolvedValueOnce({
      id: 'user-2',
      email: 'designer@example.com',
      name: 'Designer',
    })
    updatePaletteByIdMock.mockResolvedValueOnce({
      _id: 'palette-id',
      userId: 'user-1',
      slug: 'forest-glow',
      name: 'Forest Glow',
      palette: { name: 'Forest Glow', modes: { light: {}, dark: {} } },
      isPublic: false,
      lifecycleStatus: 'draft',
      version: 2,
      publishedAt: null,
      forkedFrom: null,
      collaborators: [
        { userId: 'user-2', email: 'designer@example.com', name: 'Designer' },
      ],
      createdAt: new Date('2026-03-09T10:00:00.000Z'),
      updatedAt: new Date('2026-03-10T10:00:00.000Z'),
    })
    toStoredPaletteMock.mockReturnValueOnce({
      _id: 'palette-id',
      collaborators: [
        { userId: 'user-2', email: 'designer@example.com', name: 'Designer' },
      ],
      accessLevel: 'owner',
    })

    const { sharePaletteWithUser } = await import('../../server/services/palette-service')
    const result = await sharePaletteWithUser('69af8b6940280b9bc83c3c07', 'user-1', 'designer@example.com')

    expect(findUserByEmailMock).toHaveBeenCalledWith('designer@example.com')
    expect(updatePaletteByIdMock).toHaveBeenCalledWith('palette-id', expect.objectContaining({
      collaborators: [
        { userId: 'user-2', email: 'designer@example.com', name: 'Designer' },
      ],
    }))
    expect(result).toEqual({
      _id: 'palette-id',
      collaborators: [
        { userId: 'user-2', email: 'designer@example.com', name: 'Designer' },
      ],
      accessLevel: 'owner',
    })
  })

  it('updates a palette and increments version history', async () => {
    findPaletteByIdMock.mockResolvedValueOnce({
      _id: 'palette-id',
      userId: 'user-1',
      slug: 'old-slug',
      name: 'Forest Glow',
      palette: { name: 'Forest Glow', modes: { light: {}, dark: {} } },
      isPublic: true,
      lifecycleStatus: 'published',
      version: 4,
      publishedAt: new Date('2026-03-09T10:00:00.000Z'),
      createdAt: new Date('2026-03-09T10:00:00.000Z'),
      updatedAt: new Date('2026-03-09T10:00:00.000Z'),
    })
    generateUniquePaletteSlugMock.mockResolvedValueOnce('aurora')
    normalizePaletteForStorageMock.mockImplementationOnce((name, palette) => ({ ...palette, name }))
    updatePaletteByIdMock.mockResolvedValueOnce({
      _id: 'palette-id',
      userId: 'user-1',
      slug: 'aurora',
      name: 'Aurora',
      palette: { name: 'Aurora', modes: { light: {}, dark: {} } },
      isPublic: true,
      lifecycleStatus: 'published',
      version: 5,
      publishedAt: new Date('2026-03-09T10:00:00.000Z'),
      createdAt: new Date('2026-03-09T10:00:00.000Z'),
      updatedAt: new Date('2026-03-10T10:00:00.000Z'),
    })
    toStoredPaletteMock.mockReturnValueOnce({
      _id: 'palette-id',
      userId: 'user-1',
      slug: 'aurora',
      name: 'Aurora',
      palette: { name: 'Aurora', modes: { light: {}, dark: {} } },
      isPublic: true,
      lifecycleStatus: 'published',
      version: 5,
      publishedAt: '2026-03-09T10:00:00.000Z',
      createdAt: '2026-03-09T10:00:00.000Z',
      updatedAt: '2026-03-10T10:00:00.000Z',
    })

    const { updatePaletteForUser } = await import('../../server/services/palette-service')

    await updatePaletteForUser('69af8b6940280b9bc83c3c07', 'user-1', {
      name: 'Aurora',
      palette: {
        name: 'Draft',
        modes: { light: {}, dark: {} },
      },
    })

    expect(updatePaletteByIdMock).toHaveBeenCalledWith('palette-id', expect.objectContaining({
      slug: 'aurora',
      name: 'Aurora',
      isPublic: true,
      lifecycleStatus: 'published',
      version: 5,
    }))
    expect(createPaletteVersionMock).toHaveBeenCalledWith(expect.objectContaining({
      paletteId: 'palette-id',
      version: 5,
      event: 'updated',
    }))
  })

  it('checks readiness before publishing an updated palette', async () => {
    findPaletteByIdMock.mockResolvedValueOnce({
      _id: 'palette-id',
      userId: 'user-1',
      slug: 'old-slug',
      name: 'Forest Glow',
      palette: { name: 'Forest Glow', modes: { light: {}, dark: {} } },
      isPublic: false,
      lifecycleStatus: 'draft',
      version: 2,
      publishedAt: null,
      createdAt: new Date('2026-03-09T10:00:00.000Z'),
      updatedAt: new Date('2026-03-09T10:00:00.000Z'),
    })
    generateUniquePaletteSlugMock.mockResolvedValueOnce('aurora')
    normalizePaletteForStorageMock.mockImplementationOnce((name, palette) => ({ ...palette, name }))
    updatePaletteByIdMock.mockResolvedValueOnce({})
    toStoredPaletteMock.mockReturnValueOnce({})

    const { updatePaletteForUser } = await import('../../server/services/palette-service')

    await updatePaletteForUser('69af8b6940280b9bc83c3c07', 'user-1', {
      name: 'Aurora',
      palette: {
        name: 'Draft',
        modes: { light: {}, dark: {} },
      },
      isPublic: true,
    })

    expect(assertPalettePublishReadyMock).toHaveBeenCalled()
    expect(createPaletteVersionMock).toHaveBeenCalledWith(expect.objectContaining({
      event: 'published',
      version: 3,
    }))
  })

  it('checks readiness before making a palette public and records publish event', async () => {
    const existingPalette = {
      _id: 'palette-id',
      userId: 'user-1',
      slug: 'forest-glow',
      name: 'Forest Glow',
      palette: { name: 'Forest Glow', modes: { light: {}, dark: {} } },
      isPublic: false,
      lifecycleStatus: 'draft',
      version: 1,
      publishedAt: null,
      createdAt: new Date('2026-03-09T10:00:00.000Z'),
      updatedAt: new Date('2026-03-09T10:00:00.000Z'),
    }

    findPaletteByIdMock.mockResolvedValueOnce(existingPalette)
    updatePaletteByIdMock.mockResolvedValueOnce({
      ...existingPalette,
      isPublic: true,
      lifecycleStatus: 'published',
      version: 2,
      publishedAt: new Date('2026-03-10T10:00:00.000Z'),
      updatedAt: new Date('2026-03-10T10:00:00.000Z'),
    })
    toStoredPaletteMock.mockReturnValueOnce({})

    const { setPaletteVisibilityForUser } = await import('../../server/services/palette-service')

    await setPaletteVisibilityForUser('69af8b6940280b9bc83c3c07', 'user-1', true)

    expect(assertPalettePublishReadyMock).toHaveBeenCalledWith(existingPalette.palette)
    expect(updatePaletteByIdMock).toHaveBeenCalledWith('palette-id', expect.objectContaining({
      isPublic: true,
      lifecycleStatus: 'published',
      version: 2,
    }))
    expect(createPaletteVersionMock).toHaveBeenCalledWith(expect.objectContaining({
      event: 'published',
      version: 2,
    }))
  })

  it('lists palette history for the owner', async () => {
    findPaletteByIdMock.mockResolvedValueOnce({
      _id: 'palette-id',
      userId: 'user-1',
      slug: 'forest-glow',
      name: 'Forest Glow',
      palette: { name: 'Forest Glow', modes: { light: {}, dark: {} } },
      isPublic: false,
      lifecycleStatus: 'draft',
      version: 2,
      publishedAt: null,
      createdAt: new Date('2026-03-09T10:00:00.000Z'),
      updatedAt: new Date('2026-03-09T10:00:00.000Z'),
    })
    listPaletteVersionsByPaletteIdMock.mockResolvedValueOnce([{ _id: 'version-1' }])

    const { listPaletteHistoryForUser } = await import('../../server/services/palette-service')

    const result = await listPaletteHistoryForUser('69af8b6940280b9bc83c3c07', 'user-1')

    expect(result).toEqual([{ _id: 'version-1' }])
    expect(listPaletteVersionsByPaletteIdMock).toHaveBeenCalledWith('palette-id')
  })

  it('rejects visibility changes for a non-owner', async () => {
    findPaletteByIdMock.mockResolvedValueOnce({
      _id: 'palette-id',
      userId: 'user-2',
      slug: 'forest-glow',
      name: 'Forest Glow',
      palette: { name: 'Forest Glow', modes: { light: {}, dark: {} } },
      isPublic: false,
      lifecycleStatus: 'draft',
      version: 1,
      publishedAt: null,
      createdAt: new Date('2026-03-09T10:00:00.000Z'),
      updatedAt: new Date('2026-03-09T10:00:00.000Z'),
    })

    const { setPaletteVisibilityForUser } = await import('../../server/services/palette-service')

    await expect(setPaletteVisibilityForUser('69af8b6940280b9bc83c3c07', 'user-1', true)).rejects.toMatchObject({
      statusCode: 403,
      statusMessage: 'Forbidden',
    })
  })

  it('throws when an owned palette cannot be found', async () => {
    findPaletteByIdMock.mockResolvedValueOnce(null)

    const { getOwnedPaletteByIdOrThrow } = await import('../../server/services/palette-service')

    await expect(getOwnedPaletteByIdOrThrow('69af8b6940280b9bc83c3c07', 'user-1')).rejects.toMatchObject({
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
      palette: { name: 'Forest Glow', modes: { light: {}, dark: {} } },
      isPublic: false,
      lifecycleStatus: 'draft',
      version: 1,
      publishedAt: null,
      createdAt: new Date('2026-03-09T10:00:00.000Z'),
      updatedAt: new Date('2026-03-09T10:00:00.000Z'),
    })

    const { deletePaletteForUser } = await import('../../server/services/palette-service')

    await deletePaletteForUser('69af8b6940280b9bc83c3c07', 'user-1')

    expect(deletePaletteByIdMock).toHaveBeenCalledWith('palette-id')
  })
})
