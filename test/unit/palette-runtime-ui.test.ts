import { describe, expect, it } from 'vitest'
import { resolvePaletteRuntimeUi } from '../../app/utils/palette-runtime-ui'
import type { PaletteDefinition } from '../../app/types/palette'

describe('palette runtime ui', () => {
  it('merges ui config and components for runtime application', () => {
    const palette: PaletteDefinition = {
      name: 'Test Palette',
      modes: {
        light: {
          color: { primary: '#000' },
        },
        dark: {
          color: { primary: '#fff' },
        },
      },
      ui: {
        primary: 'custom-primary',
      },
      components: {
        button: {
          slots: {
            base: 'rounded-lg',
          },
        },
        input: {
          base: {
            class: 'border-2',
          },
        },
      },
    }

    const runtimeUi = resolvePaletteRuntimeUi(palette)

    // Should include both ui and components
    // Component values with {class: "..."} should be normalized to flat strings
    expect(runtimeUi).toEqual({
      primary: 'custom-primary',
      button: {
        slots: {
          base: 'rounded-lg',
        },
      },
      input: {
        base: 'border-2', // Normalized from { class: 'border-2' }
      },
    })
  })

  it('handles palette with only components (no ui)', () => {
    const palette: PaletteDefinition = {
      name: 'Test Palette',
      modes: {
        light: { color: { primary: '#000' } },
        dark: { color: { primary: '#fff' } },
      },
      components: {
        card: {
          slots: {
            root: 'shadow-xl',
          },
        },
      },
    }

    const runtimeUi = resolvePaletteRuntimeUi(palette)

    expect(runtimeUi).toEqual({
      card: {
        slots: {
          root: 'shadow-xl',
        },
      },
    })
  })

  it('handles palette with only ui (no components)', () => {
    const palette: PaletteDefinition = {
      name: 'Test Palette',
      modes: {
        light: { color: { primary: '#000' } },
        dark: { color: { primary: '#fff' } },
      },
      ui: {
        primary: 'custom-config',
      },
    }

    const runtimeUi = resolvePaletteRuntimeUi(palette)

    expect(runtimeUi).toEqual({
      primary: 'custom-config',
    })
  })

  it('returns empty object for null palette', () => {
    const runtimeUi = resolvePaletteRuntimeUi(null)
    expect(runtimeUi).toEqual({})
  })

  it('components override ui config for same keys', () => {
    const palette: PaletteDefinition = {
      name: 'Test Palette',
      modes: {
        light: { color: { primary: '#000' } },
        dark: { color: { primary: '#fff' } },
      },
      ui: {
        button: 'from-ui',
      },
      components: {
        button: {
          slots: {
            base: 'from-components',
          },
        },
      },
    }

    const runtimeUi = resolvePaletteRuntimeUi(palette)

    // Components should win over ui for the same key
    expect(runtimeUi.button).toEqual({
      slots: {
        base: 'from-components',
      },
    })
  })
})
