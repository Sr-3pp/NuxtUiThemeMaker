import { describe, expect, it } from 'vitest'
import {
  buildFlatVariantClassString,
  parseFlatVariantClassString,
} from '../../app/utils/variant-class-editor'

describe('variant class editor', () => {
  it('parses common color and state classes into structured fields', () => {
    expect(parseFlatVariantClassString(
      'text-inverted bg-primary hover:bg-primary/75 active:bg-primary/75 focus-visible:ring-primary ring-inset',
    )).toEqual({
      text: 'text-inverted',
      bg: 'bg-primary',
      border: null,
      ring: 'ring-inset',
      hoverBg: 'hover:bg-primary/75',
      hoverText: null,
      activeBg: 'active:bg-primary/75',
      activeText: null,
      focusRing: 'focus-visible:ring-primary',
      extras: null,
    })
  })

  it('rebuilds a flat class string in stable field order', () => {
    expect(buildFlatVariantClassString({
      text: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/25',
      ring: null,
      hoverBg: 'hover:bg-primary/15',
      hoverText: null,
      activeBg: null,
      activeText: null,
      focusRing: 'focus-visible:ring-primary',
      extras: 'ring-inset transition-colors',
    })).toBe('text-primary bg-primary/10 border-primary/25 hover:bg-primary/15 focus-visible:ring-primary ring-inset transition-colors')
  })
})
