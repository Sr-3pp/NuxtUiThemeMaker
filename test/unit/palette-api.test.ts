import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { EditablePalette } from '../../app/types/palette-editor'
import type { PaletteGenerateResult } from '../../app/types/palette-generation'

vi.mock('~/utils/palette-domain', async () => {
  const actual = await vi.importActual<typeof import('../../app/utils/palette-domain')>('../../app/utils/palette-domain')

  return actual
})

function createEditablePalette(): EditablePalette {
  return {
    _id: 'palette-1',
    userId: 'user-1',
    slug: 'forest-glow',
    name: 'Forest Glow',
    isPublic: true,
    createdAt: '2026-03-20T00:00:00.000Z',
    updatedAt: '2026-03-20T01:00:00.000Z',
    modes: {
      light: {
        ui: {
          primary: '#11aa55',
          secondary: '#2255aa',
          neutral: '#888888',
          success: '#00aa66',
          info: '#0088ff',
          warning: '#ffaa00',
          error: '#ff3355',
        },
        color: {
          primary: '#11aa55',
          secondary: '#2255aa',
          neutral: '#888888',
          success: '#00aa66',
          info: '#0088ff',
          warning: '#ffaa00',
          error: '#ff3355',
        },
      },
      dark: {
        ui: {
          primary: '#44dd88',
          secondary: '#6699ff',
          neutral: '#aaaaaa',
          success: '#22dd88',
          info: '#55bbff',
          warning: '#ffcc55',
          error: '#ff6677',
        },
        color: {
          primary: '#44dd88',
          secondary: '#6699ff',
          neutral: '#aaaaaa',
          success: '#22dd88',
          info: '#55bbff',
          warning: '#ffcc55',
          error: '#ff6677',
        },
      },
    },
  }
}

function createGeneratedPaletteResult(): PaletteGenerateResult {
  return {
    palette: createEditablePalette(),
    ui: {
      card: {
        slots: {
          root: 'rounded-lg ring ring-default',
        },
      },
    },
  }
}

describe('usePaletteApi', () => {
  const fetchMock = vi.fn()
  const refreshNuxtDataMock = vi.fn()
  const useFetchMock = vi.fn()

  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    vi.stubGlobal('$fetch', fetchMock)
    vi.stubGlobal('refreshNuxtData', refreshNuxtDataMock)
    vi.stubGlobal('useFetch', useFetchMock)
  })

  it('skips save calls when the palette has no id', async () => {
    const { usePaletteApi } = await import('../../app/composables/usePaletteApi')
    const api = usePaletteApi()
    const palette = createEditablePalette()

    delete palette._id

    await expect(api.savePalette(palette)).resolves.toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('sends a cloned payload when saving an existing palette and refreshes user palettes', async () => {
    const { usePaletteApi } = await import('../../app/composables/usePaletteApi')
    const api = usePaletteApi()
    const palette = createEditablePalette()

    fetchMock.mockResolvedValueOnce({ _id: 'palette-1' })

    const result = await api.savePalette(palette)
    const requestBody = fetchMock.mock.calls[0][1].body

    expect(fetchMock).toHaveBeenCalledWith('/api/palettes/palette-1', expect.objectContaining({
      method: 'PUT',
      credentials: 'include',
    }))
    expect(requestBody).not.toBe(palette)
    expect(requestBody.palette).not.toBe(palette)
    expect(requestBody.isPublic).toBe(true)
    expect(refreshNuxtDataMock).toHaveBeenCalledWith('user-palettes')
    expect(result).toEqual({ _id: 'palette-1' })
  })

  it('creates a new private palette and refreshes user palettes', async () => {
    const { usePaletteApi } = await import('../../app/composables/usePaletteApi')
    const api = usePaletteApi()

    fetchMock.mockResolvedValueOnce({ _id: 'palette-2' })

    await api.saveNewPalette(createEditablePalette())

    expect(fetchMock).toHaveBeenCalledWith('/api/palettes', expect.objectContaining({
      method: 'POST',
      credentials: 'include',
      body: expect.objectContaining({
        name: 'Forest Glow',
        isPublic: false,
      }),
    }))
    expect(refreshNuxtDataMock).toHaveBeenCalledWith('user-palettes')
  })

  it('updates palette visibility and revalidates user palettes', async () => {
    const { usePaletteApi } = await import('../../app/composables/usePaletteApi')
    const api = usePaletteApi()

    fetchMock.mockResolvedValueOnce({ _id: 'palette-1', isPublic: false })

    const result = await api.updatePaletteVisibility('palette-1', false)

    expect(fetchMock).toHaveBeenCalledWith('/api/palettes/palette-1/visibility', expect.objectContaining({
      method: 'PATCH',
      body: { isPublic: false },
    }))
    expect(refreshNuxtDataMock).toHaveBeenCalledWith('user-palettes')
    expect(result).toEqual({ _id: 'palette-1', isPublic: false })
  })

  it('forks palettes into the user library and revalidates user palettes', async () => {
    const { usePaletteApi } = await import('../../app/composables/usePaletteApi')
    const api = usePaletteApi()

    fetchMock.mockResolvedValueOnce({ _id: 'palette-2', forkedFrom: { paletteId: 'palette-1' } })

    const result = await api.forkPalette('palette-1')

    expect(fetchMock).toHaveBeenCalledWith('/api/palettes/palette-1/fork', expect.objectContaining({
      method: 'POST',
      credentials: 'include',
    }))
    expect(refreshNuxtDataMock).toHaveBeenCalledWith('user-palettes')
    expect(result).toEqual({ _id: 'palette-2', forkedFrom: { paletteId: 'palette-1' } })
  })

  it('shares and unshares palettes through the owner access endpoints', async () => {
    const { usePaletteApi } = await import('../../app/composables/usePaletteApi')
    const api = usePaletteApi()

    fetchMock
      .mockResolvedValueOnce({ _id: 'palette-1', collaborators: [{ userId: 'user-2' }] })
      .mockResolvedValueOnce({ _id: 'palette-1', collaborators: [] })

    const shared = await api.sharePalette('palette-1', { email: 'designer@example.com' })
    const unshared = await api.unsharePalette('palette-1', 'user-2')

    expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/palettes/palette-1/share', expect.objectContaining({
      method: 'POST',
      credentials: 'include',
      body: { email: 'designer@example.com' },
    }))
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/palettes/palette-1/share/user-2', expect.objectContaining({
      method: 'DELETE',
      credentials: 'include',
    }))
    expect(shared).toEqual({ _id: 'palette-1', collaborators: [{ userId: 'user-2' }] })
    expect(unshared).toEqual({ _id: 'palette-1', collaborators: [] })
  })

  it('deletes palettes and exposes the expected fetch helpers', async () => {
    const { usePaletteApi } = await import('../../app/composables/usePaletteApi')
    const api = usePaletteApi()

    useFetchMock
      .mockReturnValueOnce({ data: { value: { canGenerate: false } } })
      .mockReturnValueOnce({ data: { value: [] } })
      .mockReturnValueOnce({ data: { value: [] } })

    await api.deletePalette('palette-1')
    api.getPaletteGenerationAccess()
    api.getUserPalettes()
    api.getPublicPalettes()

    expect(fetchMock).toHaveBeenCalledWith('/api/palettes/palette-1', expect.objectContaining({
      method: 'DELETE',
      credentials: 'include',
    }))
    expect(useFetchMock).toHaveBeenNthCalledWith(1, '/api/palettes/generation-access', expect.objectContaining({
      key: 'palette-generation-access',
      credentials: 'include',
    }))
    expect(useFetchMock).toHaveBeenNthCalledWith(2, '/api/palettes/user', expect.objectContaining({
      key: 'user-palettes',
      credentials: 'include',
    }))
    expect(useFetchMock).toHaveBeenNthCalledWith(3, '/api/palettes', expect.objectContaining({
      default: expect.any(Function),
    }))
  })

  it('generates palettes with credentials and refreshes generation access', async () => {
    const { usePaletteApi } = await import('../../app/composables/usePaletteApi')
    const api = usePaletteApi()

    fetchMock.mockResolvedValueOnce(createGeneratedPaletteResult())

    const result = await api.generatePalette('Ocean dashboard')

    expect(fetchMock).toHaveBeenCalledWith('/api/palettes/generate', expect.objectContaining({
      method: 'POST',
      credentials: 'include',
      body: { prompt: 'Ocean dashboard' },
    }))
    expect(refreshNuxtDataMock).toHaveBeenCalledWith('palette-generation-access')
    expect(result).toEqual(createGeneratedPaletteResult())
  })
})
