import { describe, expect, it } from 'vitest'
import { createSlugBase, normalizePaletteForStorage } from '../../server/domain/palette'
import { buildPaletteDescription } from '../../app/utils/seo'

describe('palette domain helpers', () => {
  it('creates stable shareable slugs from palette names', () => {
    expect(createSlugBase('  Carbon & Sulfur  ')).toBe('carbon-sulfur')
    expect(createSlugBase('')).toBe('palette')
  })

  it('builds descriptions that reflect palette visibility', () => {
    expect(buildPaletteDescription({
      name: 'Forest Glow',
      slug: 'forest-glow',
      isPublic: true,
    })).toContain('Public Nuxt UI palette "Forest Glow"')

    expect(buildPaletteDescription({
      name: 'Forest Glow',
      slug: 'forest-glow',
      isPublic: false,
    })).toContain('Private Nuxt UI palette "Forest Glow"')
  })

  it('normalizes stored palettes into the phase 1 schema', () => {
    const palette = normalizePaletteForStorage('Forest Glow', {
      name: 'Ignored',
      modes: {
        light: {
          color: {
            primary: '#11aa55',
          },
          ui: {
            primary: '#11aa55',
          },
        },
        dark: {
          color: {
            primary: '#44dd88',
          },
          ui: {
            primary: '#44dd88',
          },
        },
      },
    })

    expect(palette.name).toBe('Forest Glow')
    expect(palette.colors?.primary?.['500']).toBe('#11aa55')
    expect(palette.aliases?.primary).toBe('primary')
    expect(palette.metadata?.version).toBe(2)
  })
})
