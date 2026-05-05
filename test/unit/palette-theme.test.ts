import { describe, expect, it } from 'vitest'
import {
  buildNuxtUiConfig,
  buildPaletteModeTheme,
  buildPaletteRampTheme,
  buildPaletteThemeData,
  parsePaletteThemeTokens,
} from '../../app/utils/palette-theme'

describe('palette theme utils', () => {
  it('builds and parses Nuxt UI CSS variable tokens from one source of truth', () => {
    const theme = buildPaletteModeTheme({
      color: {
        primary: '#11aa55',
      },
      text: {
        default: '#111111',
        muted: '#666666',
      },
      ui: {
        border: '#cbd5e1',
      },
    })

    expect(theme).toEqual({
      '--ui-primary': '#11aa55',
      '--ui-text': '#111111',
      '--ui-text-muted': '#666666',
      '--ui-border': '#cbd5e1',
    })

    expect(parsePaletteThemeTokens(theme)).toEqual({
      color: {
        primary: '#11aa55',
      },
      text: {
        default: '#111111',
        muted: '#666666',
      },
      ui: {
        border: '#cbd5e1',
      },
    })
  })

  it('builds color ramp variables for every provided scale step', () => {
    expect(buildPaletteRampTheme({
      primary: {
        '50': '#f0fff4',
        '100': null,
        '200': null,
        '300': null,
        '400': null,
        '500': '#11aa55',
        '600': null,
        '700': null,
        '800': null,
        '900': null,
        '950': '#062e18',
      },
    })).toEqual({
      '--ui-color-primary-50': '#f0fff4',
      '--ui-color-primary-500': '#11aa55',
      '--ui-color-primary-950': '#062e18',
    })
  })

  it('assembles exportable theme data and Nuxt UI config centrally', () => {
    const data = buildPaletteThemeData({
      name: 'Forest Glow',
      modes: {
        light: {
          color: { primary: '#11aa55' },
        },
        dark: {
          color: { primary: '#44dd88' },
        },
      },
      ui: {
        card: {
          slots: {
            root: 'rounded-md',
          },
        },
        modal: {
          slots: {
            content: 'border border-default',
          },
        },
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
    })

    expect(data.cssVars.light['--ui-primary']).toBe('#11aa55')
    expect(data.cssVars.light['--ui-color-primary-500']).toBe('#11aa55')
    expect(data.components.button?.compoundVariants).toEqual([{
      variant: 'solid',
      color: 'primary',
      class: 'bg-primary',
    }])

    expect(buildNuxtUiConfig(data)).toMatchObject({
      theme: data.cssVars,
      button: data.components.button,
      card: data.components.card,
      modal: data.components.modal,
    })
  })
})
