import { describe, it, expect } from 'vitest'
import { 
  getComponentThemeEditorDefinitions,
  getComponentThemeTokenGroup 
} from '../../app/utils/component-theme-editor'
import type { PaletteComponentThemes } from '../../app/types/palette'

describe('component theme editor - mixed format support', () => {
  it('handles components with flat string values', () => {
    const components: PaletteComponentThemes = {
      button: {
        base: 'rounded-lg font-semibold',
        slots: {
          label: 'text-sm uppercase',
        },
        variants: {
          size: {
            sm: 'px-2 py-1',
            md: 'px-4 py-2',
          },
        },
      },
    }

    const definitions = getComponentThemeEditorDefinitions(components)
    expect(definitions.length).toBeGreaterThan(0)

    const buttonDef = definitions.find(d => d.value === 'button')
    expect(buttonDef).toBeDefined()
    expect(buttonDef?.areas).toContain('base')
    expect(buttonDef?.areas).toContain('slot')
    expect(buttonDef?.areas).toContain('variant')
    expect(buttonDef?.slots).toContain('label')
    expect(buttonDef?.variants).toContain('size')
  })

  it('handles components with token group objects', () => {
    const components: PaletteComponentThemes = {
      card: {
        base: {
          bg: 'white',
          text: 'gray-900',
          border: 'gray-200',
        },
        slots: {
          header: {
            bg: 'gray-50',
            text: 'gray-900',
          },
        },
      },
    }

    const definitions = getComponentThemeEditorDefinitions(components)
    const cardDef = definitions.find(d => d.value === 'card')
    
    expect(cardDef).toBeDefined()
    expect(cardDef?.areas).toContain('base')
    expect(cardDef?.areas).toContain('slot')
    expect(cardDef?.slots).toContain('header')
  })

  it('handles mixed format in the same component', () => {
    const components: PaletteComponentThemes = {
      input: {
        base: 'border-2 rounded', // flat string
        slots: {
          input: { // token group object
            bg: 'white',
            text: 'gray-900',
          },
          label: 'font-medium text-sm', // flat string
        },
        variants: {
          size: {
            sm: 'text-xs', // flat string
            md: { // token group object
              text: 'text-sm',
              padding: 'px-4 py-2',
            },
          },
        },
      },
    }

    const definitions = getComponentThemeEditorDefinitions(components)
    const inputDef = definitions.find(d => d.value === 'input')
    
    expect(inputDef).toBeDefined()
    expect(inputDef?.areas).toContain('base')
    expect(inputDef?.areas).toContain('slot')
    expect(inputDef?.areas).toContain('variant')
    expect(inputDef?.slots).toContain('input')
    expect(inputDef?.slots).toContain('label')
    expect(inputDef?.variants).toContain('size')

    // Token suggestions should include keys from both formats
    expect(inputDef?.tokenSuggestions.slot).toContain('bg')
    expect(inputDef?.tokenSuggestions.slot).toContain('text')
    expect(inputDef?.tokenSuggestions.slot).toContain('class')
  })

  it('extracts token groups correctly from flat strings', () => {
    const components: PaletteComponentThemes = {
      badge: {
        base: 'inline-flex items-center rounded-full',
      },
    }

    const tokenGroup = getComponentThemeTokenGroup(components.badge, 'base')
    
    expect(tokenGroup).toEqual({
      class: 'inline-flex items-center rounded-full',
    })
  })

  it('extracts token groups correctly from objects', () => {
    const components: PaletteComponentThemes = {
      alert: {
        base: {
          bg: 'blue-50',
          text: 'blue-900',
          border: 'blue-200',
        },
      },
    }

    const tokenGroup = getComponentThemeTokenGroup(components.alert, 'base')
    
    expect(tokenGroup).toEqual({
      bg: 'blue-50',
      text: 'blue-900',
      border: 'blue-200',
    })
  })

  it('handles slot token extraction with mixed formats', () => {
    const components: PaletteComponentThemes = {
      modal: {
        slots: {
          overlay: 'fixed inset-0 bg-black/50',
          content: {
            bg: 'white',
            shadow: 'xl',
          },
        },
      },
    }

    const overlayTokens = getComponentThemeTokenGroup(components.modal, 'slot', { slot: 'overlay' })
    expect(overlayTokens).toEqual({
      class: 'fixed inset-0 bg-black/50',
    })

    const contentTokens = getComponentThemeTokenGroup(components.modal, 'slot', { slot: 'content' })
    expect(contentTokens).toEqual({
      bg: 'white',
      shadow: 'xl',
    })
  })

  it('handles variant token extraction with mixed formats', () => {
    const components: PaletteComponentThemes = {
      button: {
        variants: {
          color: {
            primary: {
              bg: 'blue-500',
              text: 'white',
            },
            secondary: 'bg-gray-200 text-gray-700',
          },
        },
      },
    }

    const primary = getComponentThemeTokenGroup(components.button, 'variant', { 
      variant: 'color', 
      variantColor: 'primary' 
    })
    expect(primary).toEqual({
      bg: 'blue-500',
      text: 'white',
    })

    const secondary = getComponentThemeTokenGroup(components.button, 'variant', { 
      variant: 'color', 
      variantColor: 'secondary' 
    })
    expect(secondary).toEqual({
      class: 'bg-gray-200 text-gray-700',
    })
  })

  it('handles undefined/null values gracefully', () => {
    const components: PaletteComponentThemes = {
      empty: {},
    }

    const tokenGroup = getComponentThemeTokenGroup(components.empty, 'base')
    expect(tokenGroup).toEqual({})
  })
})
