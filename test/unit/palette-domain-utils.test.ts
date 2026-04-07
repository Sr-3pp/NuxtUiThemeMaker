import { describe, expect, it } from 'vitest'
import {
  clonePaletteDefinition,
  createEditablePalette,
  hydratePaletteDefinition,
  normalizePaletteDefinition,
  updateEditablePaletteToken,
} from '../../app/utils/palette-domain'
import type { PaletteDefinition } from '../../app/types/palette'

function createPalette(overrides?: Partial<PaletteDefinition>): PaletteDefinition {
  return {
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
        text: {
          default: '#111111',
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
        text: {
          default: '#f5f5f5',
        },
      },
    },
    ...overrides,
  }
}

describe('palette domain utils', () => {
  it('clones palette definitions without preserving nested references', () => {
    const palette = createPalette()
    const cloned = clonePaletteDefinition(palette)

    cloned.modes.light.ui.primary = '#000000'

    expect(palette.modes.light.ui.primary).toBe('#11aa55')
    expect(cloned).not.toBe(palette)
    expect(cloned.modes.light).not.toBe(palette.modes.light)
  })

  it('hydrates missing color sections from semantic ui tokens', () => {
    const palette = createPalette()
    delete palette.modes.light.color
    delete palette.modes.dark.color

    const hydrated = hydratePaletteDefinition(palette)

    expect(hydrated.modes.light.color).toEqual({
      primary: '#11aa55',
      secondary: '#2255aa',
      neutral: '#888888',
      success: '#00aa66',
      info: '#0088ff',
      warning: '#ffaa00',
      error: '#ff3355',
    })
    expect(hydrated.modes.dark.color?.error).toBe('#ff6677')
    expect(hydrated.colors?.primary?.['500']).toBe('#11aa55')
    expect(hydrated.aliases?.primary).toBe('primary')
    expect(hydrated.metadata?.version).toBe(2)
  })

  it('normalizes legacy palettes into the expanded phase 1 shape', () => {
    const normalized = normalizePaletteDefinition(createPalette())

    expect(normalized.colors?.primary).toEqual({
      '50': null,
      '100': null,
      '200': null,
      '300': null,
      '400': null,
      '500': '#11aa55',
      '600': null,
      '700': null,
      '800': null,
      '900': null,
      '950': null,
    })
    expect(normalized.aliases?.warning).toBe('warning')
    expect(normalized.components).toEqual({})
    expect(normalized.metadata).toEqual({
      version: 2,
      normalizedAt: null,
    })
  })

  it('creates editable palettes from stored palettes and keeps metadata', () => {
    const editable = createEditablePalette({
      _id: 'palette-1',
      userId: 'user-1',
      slug: 'forest-glow',
      name: 'Forest Glow',
      palette: createPalette(),
      isPublic: true,
      createdAt: '2026-03-20T00:00:00.000Z',
      updatedAt: '2026-03-20T01:00:00.000Z',
    })

    expect(editable._id).toBe('palette-1')
    expect(editable.slug).toBe('forest-glow')
    expect(editable.modes.light.color?.primary).toBe('#11aa55')
  })

  it('keeps semantic ui tokens in sync when color tokens change', () => {
    const editable = createEditablePalette(createPalette())

    updateEditablePaletteToken(editable, {
      mode: 'light',
      section: 'color',
      token: 'primary',
      value: '#ffffff',
    })

    expect(editable.modes.light.color?.primary).toBe('#ffffff')
    expect(editable.modes.light.ui.primary).toBe('#ffffff')
    expect(editable.colors?.primary?.['500']).toBe('#ffffff')
  })
})
