import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { StoredPalette } from '../../app/types/palette-store'

vi.mock('~/utils/paletteRegistry', () => {
  return {
    emptyPalette: {
      name: 'Empty Palette',
      modes: {
        light: {
          ui: {
            primary: null,
            secondary: null,
            neutral: null,
            success: null,
            info: null,
            warning: null,
            error: null,
          },
          color: {
            primary: null,
            secondary: null,
            neutral: null,
            success: null,
            info: null,
            warning: null,
            error: null,
          },
        },
        dark: {
          ui: {
            primary: null,
            secondary: null,
            neutral: null,
            success: null,
            info: null,
            warning: null,
            error: null,
          },
          color: {
            primary: null,
            secondary: null,
            neutral: null,
            success: null,
            info: null,
            warning: null,
            error: null,
          },
        },
      },
    },
  }
})

vi.mock('~/utils/palette-domain', async () => {
  const actual = await vi.importActual<typeof import('../../app/utils/palette-domain')>('../../app/utils/palette-domain')

  return actual
})

function createStoredPalette(): StoredPalette {
  return {
    _id: 'palette-1',
    userId: 'user-1',
    slug: 'forest-glow',
    name: 'Forest Glow',
    palette: {
      name: 'Forest Glow',
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
    },
    isPublic: true,
    createdAt: '2026-03-20T00:00:00.000Z',
    updatedAt: '2026-03-20T01:00:00.000Z',
  }
}

describe('usePaletteState', () => {
  beforeEach(() => {
    vi.resetModules()

    const stateMap = new Map<string, { value: unknown }>()

    vi.stubGlobal('useState', (key: string, init: () => unknown) => {
      if (!stateMap.has(key)) {
        stateMap.set(key, { value: init() })
      }

      return stateMap.get(key)
    })
  })

  it('sets source and current palettes independently', async () => {
    const palette = createStoredPalette()
    const { usePaletteState } = await import('../../app/composables/usePaletteState')
    const { currentPalette, sourcePalette, setCurrentPalette } = usePaletteState()

    setCurrentPalette(palette)
    currentPalette.value!.modes.light.ui.primary = '#ffffff'

    expect(sourcePalette.value?._id).toBe('palette-1')
    expect(sourcePalette.value?.modes.light.ui.primary).toBe('#11aa55')
    expect(currentPalette.value?.modes.light.ui.primary).toBe('#ffffff')
  })

  it('resets the current palette back to the source palette snapshot', async () => {
    const { usePaletteState } = await import('../../app/composables/usePaletteState')
    const { currentPalette, resetCurrentPalette, setCurrentPalette, updatePaletteName } = usePaletteState()

    setCurrentPalette(createStoredPalette())
    updatePaletteName('Changed Name')
    currentPalette.value!.modes.light.color!.primary = '#ffffff'
    resetCurrentPalette()

    expect(currentPalette.value?.name).toBe('Forest Glow')
    expect(currentPalette.value?.modes.light.color?.primary).toBe('#11aa55')
  })

  it('creates an empty palette when the source palette is missing', async () => {
    const { usePaletteState } = await import('../../app/composables/usePaletteState')
    const { currentPalette, sourcePalette, resetCurrentPalette } = usePaletteState()

    sourcePalette.value = null
    currentPalette.value = null
    resetCurrentPalette()

    expect(currentPalette.value?.name).toBe('Empty Palette')
    expect(sourcePalette.value?.name).toBe('Empty Palette')
  })

  it('updates palette names and tokens on the current palette only', async () => {
    const { usePaletteState } = await import('../../app/composables/usePaletteState')
    const { currentPalette, setCurrentPalette, updatePalette, updatePaletteName } = usePaletteState()

    setCurrentPalette(createStoredPalette())
    updatePaletteName('Aurora')
    updatePalette({
      mode: 'light',
      section: 'color',
      token: 'primary',
      value: '#123456',
    })

    expect(currentPalette.value?.name).toBe('Aurora')
    expect(currentPalette.value?.modes.light.color?.primary).toBe('#123456')
    expect(currentPalette.value?.modes.light.ui.primary).toBe('#123456')
  })
})
