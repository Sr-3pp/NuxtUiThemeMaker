import { describe, expect, it } from 'vitest'
import { getPreviewButtonStyle, getPreviewInputStyle, getPreviewVariantStyle } from '../../app/utils/preview-overrides'

describe('preview overrides', () => {
  it('maps button component overrides to preview styles', () => {
    const style = getPreviewButtonStyle({
      name: 'Forest Glow',
      modes: {
        light: {},
        dark: {},
      },
      components: {
        button: {
          variants: {
            solid: {
              primary: {
                bg: 'var(--ui-primary)',
                text: '#ffffff',
                border: 'transparent',
                ring: 'var(--ui-primary)',
              },
            },
          },
        },
      },
    }, 'solid', 'primary')

    expect(style).toMatchObject({
      backgroundColor: 'var(--ui-primary)',
      color: '#ffffff',
      borderColor: 'transparent',
      borderWidth: '1px',
      borderStyle: 'solid',
      boxShadow: '0 0 0 1px var(--ui-primary)',
    })
  })

  it('maps input component overrides to preview styles', () => {
    const style = getPreviewInputStyle({
      name: 'Forest Glow',
      modes: {
        light: {},
        dark: {},
      },
      components: {
        input: {
          base: {
            bg: 'var(--ui-bg-elevated)',
            text: 'var(--ui-text)',
            border: 'var(--ui-border)',
          },
        },
      },
    })

    expect(style).toMatchObject({
      backgroundColor: 'var(--ui-bg-elevated)',
      color: 'var(--ui-text)',
      borderColor: 'var(--ui-border)',
      borderWidth: '1px',
      borderStyle: 'solid',
    })
  })

  it('maps flat class-string variants to runtime preview styles without relying on compiled classes', () => {
    const style = getPreviewVariantStyle({
      name: 'Forest Glow',
      modes: {
        light: {
          color: {
            primary: '#11aa55',
          },
          text: {
            inverted: '#ffffff',
          },
          bg: {},
          ui: {
            ring: '#0f8a44',
          },
        },
        dark: {
          color: {
            primary: '#44dd88',
          },
          text: {
            inverted: '#020617',
          },
          bg: {},
          ui: {
            ring: '#7ee2a8',
          },
        },
      },
      components: {
        button: {
          variants: {
            solid: {
              primary: 'text-inverted bg-primary/10 ring-ring',
            },
          },
        },
      },
    }, 'button', 'solid', 'primary', { mode: 'light' })

    expect(style).toMatchObject({
      backgroundColor: 'color-mix(in srgb, #11aa55 10%, transparent)',
      color: '#ffffff',
      boxShadow: '0 0 0 1px #0f8a44',
    })
  })

  it('maps structured variant fields to preview styles and classes', () => {
    const palette = {
      name: 'Forest Glow',
      modes: {
        light: {
          color: {
            primary: '#11aa55',
          },
          text: {
            inverted: '#ffffff',
          },
          bg: {},
          ui: {
            ring: '#0f8a44',
          },
        },
        dark: {
          color: {
            primary: '#44dd88',
          },
          text: {
            inverted: '#020617',
          },
          bg: {},
          ui: {
            ring: '#7ee2a8',
          },
        },
      },
      components: {
        button: {
          variants: {
            solid: {
              primary: {
                text: 'text-inverted',
                bg: 'bg-primary/10',
                ring: 'ring-ring',
              },
            },
          },
        },
      },
    } as const

    expect(getPreviewVariantStyle(palette, 'button', 'solid', 'primary', { mode: 'light' })).toMatchObject({
      backgroundColor: 'color-mix(in srgb, #11aa55 10%, transparent)',
      color: '#ffffff',
      boxShadow: '0 0 0 1px #0f8a44',
    })
  })
})
