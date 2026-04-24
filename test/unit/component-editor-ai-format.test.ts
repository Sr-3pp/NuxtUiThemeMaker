import { describe, it, expect } from 'vitest'
import { getComponentThemeTokenGroup } from '../../app/utils/component-theme-editor'
import type { PaletteComponentThemes } from '../../app/types/palette'

describe('component editor - AI-generated flat strings', () => {
  it('handles AI-generated flat class strings correctly', () => {
    // Simulate AI-generated components with flat class strings
    const components: PaletteComponentThemes = {
      button: {
        base: 'rounded-lg font-semibold shadow-sm',
        variants: {
          solid: {
            primary: 'bg-blue-500 text-white hover:bg-blue-600',
            secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
          },
        },
      },
      input: {
        base: 'border-2 rounded-md px-3 py-2',
        slots: {
          input: 'bg-white text-gray-900',
        },
      },
    }

    // Get base token group - should normalize flat string to { class: "..." }
    const buttonBase = getComponentThemeTokenGroup(components.button, 'base')
    expect(buttonBase).toEqual({
      class: 'rounded-lg font-semibold shadow-sm',
    })

    // Get variant token group
    const primaryVariant = getComponentThemeTokenGroup(components.button, 'variant', {
      variant: 'solid',
      variantColor: 'primary',
    })
    expect(primaryVariant).toEqual({
      class: 'bg-blue-500 text-white hover:bg-blue-600',
    })

    // Get slot token group
    const inputSlot = getComponentThemeTokenGroup(components.input, 'slot', {
      slot: 'input',
    })
    expect(inputSlot).toEqual({
      class: 'bg-white text-gray-900',
    })
  })

  it('preserves token objects when they are not flat strings', () => {
    const components: PaletteComponentThemes = {
      card: {
        base: {
          bg: 'white',
          text: 'gray-900',
          border: 'gray-200',
        },
      },
    }

    const cardBase = getComponentThemeTokenGroup(components.card, 'base')
    expect(cardBase).toEqual({
      bg: 'white',
      text: 'gray-900',
      border: 'gray-200',
    })
  })

  it('identifies flat class strings by checking for single "class" key', () => {
    const flatString = { class: 'rounded-lg' }
    const tokenObject = { bg: 'blue', text: 'white' }
    const mixedObject = { class: 'rounded-lg', bg: 'blue' }

    const isFlatString = (obj: Record<string, string>) => {
      const keys = Object.keys(obj)
      return keys.length === 1 && keys[0] === 'class'
    }

    expect(isFlatString(flatString)).toBe(true)
    expect(isFlatString(tokenObject)).toBe(false)
    expect(isFlatString(mixedObject)).toBe(false)
  })

  it('handles mixed component structures', () => {
    const components: PaletteComponentThemes = {
      alert: {
        base: 'p-4 rounded-lg', // Flat string
        slots: {
          icon: {
            // Token object
            text: 'blue-500',
            size: 'lg',
          },
          title: 'font-bold text-lg', // Flat string
        },
        variants: {
          color: {
            info: {
              // Token object
              bg: 'blue-50',
              text: 'blue-900',
            },
            success: 'bg-green-50 text-green-900', // Flat string
          },
        },
      },
    }

    const base = getComponentThemeTokenGroup(components.alert, 'base')
    expect(base).toEqual({ class: 'p-4 rounded-lg' })

    const iconSlot = getComponentThemeTokenGroup(components.alert, 'slot', { slot: 'icon' })
    expect(iconSlot).toEqual({ text: 'blue-500', size: 'lg' })

    const titleSlot = getComponentThemeTokenGroup(components.alert, 'slot', { slot: 'title' })
    expect(titleSlot).toEqual({ class: 'font-bold text-lg' })

    const infoVariant = getComponentThemeTokenGroup(components.alert, 'variant', {
      variant: 'color',
      variantColor: 'info',
    })
    expect(infoVariant).toEqual({ bg: 'blue-50', text: 'blue-900' })

    const successVariant = getComponentThemeTokenGroup(components.alert, 'variant', {
      variant: 'color',
      variantColor: 'success',
    })
    expect(successVariant).toEqual({ class: 'bg-green-50 text-green-900' })
  })

  it('handles empty and undefined component values', () => {
    const components: PaletteComponentThemes = {
      empty: {},
      withUndefined: {
        base: undefined,
      },
    }

    const emptyBase = getComponentThemeTokenGroup(components.empty, 'base')
    expect(emptyBase).toEqual({})

    const undefinedBase = getComponentThemeTokenGroup(components.withUndefined, 'base')
    expect(undefinedBase).toEqual({})
  })
})
