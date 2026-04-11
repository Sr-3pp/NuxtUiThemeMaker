import { describe, expect, it } from 'vitest'
import type { PaletteDefinition } from '../../app/types/palette'
import { comparePaletteVersions } from '../../app/utils/palette-compare'

function createPalette(): PaletteDefinition {
  return {
    name: 'Forest Glow',
    modes: {
      light: {
        ui: {
          primary: '#11aa55',
        },
        text: {
          default: '#111111',
        },
      },
      dark: {
        ui: {
          primary: '#44dd88',
        },
        text: {
          default: '#f5f5f5',
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
    aliases: {
      primary: 'primary',
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
    metadata: {
      version: 2,
      normalizedAt: null,
    },
  }
}

describe('palette compare utils', () => {
  it('returns added, removed, and changed entries with section counts', () => {
    const fromPalette = createPalette()
    const toPalette = createPalette()

    toPalette.modes.light.ui.primary = '#229966'
    toPalette.aliases = {}
    toPalette.colors!.primary!['950'] = null
    toPalette.components!.badge = {
      base: {
        bg: 'var(--ui-primary)',
      },
    }

    const comparison = comparePaletteVersions(fromPalette, toPalette, {
      fromVersion: 1,
      toVersion: 2,
    })

    expect(comparison.fromVersion).toBe(1)
    expect(comparison.toVersion).toBe(2)
    expect(comparison.totalChanges).toBe(4)
    expect(comparison.changedCount).toBe(1)
    expect(comparison.addedCount).toBe(1)
    expect(comparison.removedCount).toBe(2)
    expect(comparison.sectionCounts).toEqual({
      'Aliases': 1,
      'Color scales': 1,
      'Components': 1,
      'Light mode': 1,
    })
    expect(comparison.changes).toEqual(expect.arrayContaining([
      expect.objectContaining({
        path: 'modes.light.ui.primary',
        type: 'changed',
        section: 'Light mode',
        before: '#11aa55',
        after: '#229966',
      }),
      expect.objectContaining({
        path: 'aliases.primary',
        type: 'removed',
        section: 'Aliases',
        before: 'primary',
        after: null,
      }),
      expect.objectContaining({
        path: 'colors.primary.950',
        type: 'removed',
        section: 'Color scales',
        before: '#062a18',
        after: null,
      }),
      expect.objectContaining({
        path: 'components.badge.base.bg',
        type: 'added',
        section: 'Components',
        before: null,
        after: 'var(--ui-primary)',
      }),
    ]))
  })

  it('returns an empty diff when versions are identical', () => {
    const palette = createPalette()

    const comparison = comparePaletteVersions(palette, palette, {
      fromVersion: 3,
      toVersion: 4,
    })

    expect(comparison.totalChanges).toBe(0)
    expect(comparison.changes).toEqual([])
    expect(comparison.sectionCounts).toEqual({})
  })
})
