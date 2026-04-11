import { describe, expect, it } from 'vitest'
import type { PaletteDefinition } from '../../app/types/palette'
import {
  createPaletteWithGeneratedComponents,
  createPaletteWithGeneratedRamps,
} from '../../app/utils/palette-domain'

function createPalette(): PaletteDefinition {
  return {
    name: 'Baseline',
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
    colors: {
      primary: {
        '50': '#effcf5',
        '100': '#d8f6e7',
        '200': '#b1edd0',
        '300': '#87e1b5',
        '400': '#52ce92',
        '500': '#11aa55',
        '600': '#0e8e47',
        '700': '#0e713c',
        '800': '#105a33',
        '900': '#10492d',
        '950': '#062a18',
      },
    },
    components: {
      button: {
        variants: {
          solid: {
            primary: {
              bg: 'var(--ui-primary)',
            },
          },
        },
      },
    },
  }
}

describe('palette AI preview helpers', () => {
  it('creates a preview palette with generated ramps applied', () => {
    const original = createPalette()
    const preview = createPaletteWithGeneratedRamps(original, {
      primary: {
        '50': '#f0f9ff',
        '100': '#e0f2fe',
        '200': '#bae6fd',
        '300': '#7dd3fc',
        '400': '#38bdf8',
        '500': '#0ea5e9',
        '600': '#0284c7',
        '700': '#0369a1',
        '800': '#075985',
        '900': '#0c4a6e',
        '950': '#082f49',
      },
    })

    expect(preview.colors?.primary?.['500']).toBe('#0ea5e9')
    expect(preview.modes.light.color?.primary).toBe('#0ea5e9')
    expect(preview.modes.dark.ui.primary).toBe('#0ea5e9')
    expect(original.colors?.primary?.['500']).toBe('#11aa55')
  })

  it('creates a preview palette with generated components merged', () => {
    const original = createPalette()
    const preview = createPaletteWithGeneratedComponents(original, {
      card: {
        base: {
          bg: 'var(--ui-bg-elevated)',
          border: 'var(--ui-border)',
        },
      },
    })

    expect(preview.components?.button?.variants?.solid?.primary?.bg).toBe('var(--ui-primary)')
    expect(preview.components?.card?.base?.bg).toBe('var(--ui-bg-elevated)')
    expect(original.components?.card).toBeUndefined()
  })
})
