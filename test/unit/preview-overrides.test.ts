import { describe, expect, it } from 'vitest'
import { getPreviewButtonStyle, getPreviewInputStyle } from '../../app/utils/preview-overrides'

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
})
