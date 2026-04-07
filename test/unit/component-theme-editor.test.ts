import { describe, expect, it } from 'vitest'
import {
  getComponentThemeEditorDefinitions,
  getComponentThemeStateNames,
  getComponentThemeTokenGroup,
} from '../../app/utils/component-theme-editor'

describe('component theme editor utils', () => {
  it('returns seeded definitions for common Nuxt UI components', () => {
    const definitions = getComponentThemeEditorDefinitions()
    const button = definitions.find(definition => definition.value === 'button')
    const input = definitions.find(definition => definition.value === 'input')

    expect(button?.areas).toContain('variant')
    expect(button?.variants).toContain('solid')
    expect(button?.tokenSuggestions.variant).toContain('bg')
    expect(input?.areas).toContain('slot')
    expect(input?.slots).toContain('leading')
  })

  it('merges dynamic schema values into editor definitions', () => {
    const definitions = getComponentThemeEditorDefinitions({
      navigationMenu: {
        variants: {
          pill: {
            brand: {
              bg: 'var(--ui-primary)',
            },
          },
        },
        states: {
          hover: {
            ring: 'var(--ui-primary)',
          },
        },
      },
    })

    const navigationMenu = definitions.find(definition => definition.value === 'navigationMenu')

    expect(navigationMenu?.areas).toContain('variant')
    expect(navigationMenu?.areas).toContain('state')
    expect(navigationMenu?.variants).toContain('pill')
    expect(navigationMenu?.variantColors).toContain('brand')
  })

  it('reads token groups from the normalized component schema', () => {
    const tokenGroup = getComponentThemeTokenGroup({
      variants: {
        solid: {
          primary: {
            bg: 'var(--ui-primary)',
          },
        },
      },
    }, 'variant', {
      variant: 'solid',
      variantColor: 'primary',
    })

    expect(tokenGroup).toEqual({
      bg: 'var(--ui-primary)',
    })
  })

  it('collects default and stored state names', () => {
    const states = getComponentThemeStateNames({
      button: {
        states: {
          pressed: {
            bg: '#000000',
          },
        },
      },
    })

    expect(states).toContain('hover')
    expect(states).toContain('pressed')
  })
})
