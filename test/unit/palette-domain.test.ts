import { describe, expect, it } from 'vitest'
import { createSlugBase } from '../../server/domain/palette'
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
})
