import { describe, it, expect } from 'vitest'
import { normalizeComponentThemes } from '../../app/utils/palette-io'

describe('palette component normalization', () => {
  it('normalizes {class: "..."} to flat strings', () => {
    const components = {
      button: {
        base: { class: 'rounded-lg font-semibold' },
        slots: {
          label: { class: 'text-sm' },
        },
      },
    }

    const normalized = normalizeComponentThemes(components)

    expect(normalized).toEqual({
      button: {
        base: 'rounded-lg font-semibold',
        slots: {
          label: 'text-sm',
        },
      },
    })
  })

  it('keeps proper token objects unchanged', () => {
    const components = {
      button: {
        variants: {
          solid: {
            primary: {
              bg: 'blue-500',
              text: 'white',
              border: 'blue-600',
            },
          },
        },
      },
    }

    const normalized = normalizeComponentThemes(components)

    expect(normalized).toEqual({
      button: {
        variants: {
          solid: {
            primary: {
              bg: 'blue-500',
              text: 'white',
              border: 'blue-600',
            },
          },
        },
      },
    })
  })

  it('keeps flat strings unchanged', () => {
    const components = {
      input: {
        base: 'border-2 rounded',
        slots: {
          input: 'px-4 py-2',
        },
      },
    }

    const normalized = normalizeComponentThemes(components)

    expect(normalized).toEqual({
      input: {
        base: 'border-2 rounded',
        slots: {
          input: 'px-4 py-2',
        },
      },
    })
  })

  it('handles mixed formats in the same component', () => {
    const components = {
      card: {
        base: { class: 'shadow-lg' }, // Should normalize
        slots: {
          header: 'p-4', // Already string
          body: {
            // Token object
            bg: 'white',
            text: 'gray-900',
          },
        },
        variants: {
          bordered: {
            true: { class: 'border border-gray-200' }, // Should normalize
          },
        },
      },
    }

    const normalized = normalizeComponentThemes(components)

    expect(normalized).toEqual({
      card: {
        base: 'shadow-lg',
        slots: {
          header: 'p-4',
          body: {
            bg: 'white',
            text: 'gray-900',
          },
        },
        variants: {
          bordered: {
            true: 'border border-gray-200',
          },
        },
      },
    })
  })

  it('handles deeply nested variant structures', () => {
    const components = {
      button: {
        base: { class: 'font-medium' },
        variants: {
          size: {
            sm: { class: 'text-xs px-2 py-1' },
            md: { class: 'text-sm px-4 py-2' },
            lg: { class: 'text-base px-6 py-3' },
          },
          color: {
            primary: {
              bg: 'blue-500',
              text: 'white',
            },
            secondary: { class: 'bg-gray-200 text-gray-700' },
          },
        },
      },
    }

    const normalized = normalizeComponentThemes(components)

    expect(normalized).toEqual({
      button: {
        base: 'font-medium',
        variants: {
          size: {
            sm: 'text-xs px-2 py-1',
            md: 'text-sm px-4 py-2',
            lg: 'text-base px-6 py-3',
          },
          color: {
            primary: {
              bg: 'blue-500',
              text: 'white',
            },
            secondary: 'bg-gray-200 text-gray-700',
          },
        },
      },
    })
  })

  it('handles empty components', () => {
    expect(normalizeComponentThemes(undefined)).toEqual({})
    expect(normalizeComponentThemes({})).toEqual({})
  })

  it('preserves defaultVariants and compoundVariants', () => {
    const components = {
      button: {
        base: { class: 'rounded' },
        defaultVariants: {
          size: 'md',
          color: 'primary',
        },
        compoundVariants: [
          {
            size: 'sm',
            color: 'primary',
            class: 'font-bold',
          },
        ],
      },
    }

    const normalized = normalizeComponentThemes(components)

    expect(normalized).toEqual({
      button: {
        base: 'rounded',
        defaultVariants: {
          size: 'md',
          color: 'primary',
        },
        compoundVariants: [
          {
            size: 'sm',
            color: 'primary',
            class: 'font-bold',
          },
        ],
      },
    })
  })
})
