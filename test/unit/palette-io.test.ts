import { describe, expect, it } from 'vitest'
import {
  normalizeImportedPalette,
  normalizeImportedPaletteFromText,
  serializePaletteExport,
} from '../../app/utils/palette-io'

describe('palette io', () => {
  it('normalizes imported legacy palettes into the phase 1 shape', () => {
    const palette = normalizeImportedPalette({
      name: 'Forest Glow',
      modes: {
        light: {
          ui: {
            primary: '#11aa55',
            secondary: '#2255aa',
            neutral: '#888888',
            success: '#00aa66',
            info: '#0088ff',
            warning: '#ffaa00',
            error: '#ff3355',
          },
          text: {
            default: '#111111',
          },
        },
        dark: {
          ui: {
            primary: '#44dd88',
            secondary: '#6699ff',
            neutral: '#aaaaaa',
            success: '#22dd88',
            info: '#55bbff',
            warning: '#ffcc55',
            error: '#ff6677',
          },
          text: {
            default: '#f5f5f5',
          },
        },
      },
    })

    expect(palette.colors?.primary?.['500']).toBe('#11aa55')
    expect(palette.aliases?.error).toBe('error')
    expect(palette.metadata?.version).toBe(2)
  })

  it('serializes normalized palette exports', () => {
    const serialized = serializePaletteExport({
      name: 'Forest Glow',
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

    const parsed = JSON.parse(serialized) as {
      colors?: {
        primary?: {
          '500'?: string | null
        }
      }
      metadata?: {
        version?: number
      }
    }

    expect(parsed.colors?.primary?.['500']).toBe('#11aa55')
    expect(parsed.metadata?.version).toBe(2)
  })

  it('imports palettes from CSS variable blocks', () => {
    const palette = normalizeImportedPaletteFromText(`
      :root {
        --ui-primary: #11aa55;
        --ui-text: #111111;
        --ui-bg: #f8fafc;
        --ui-border: #cbd5e1;
      }

      .dark {
        --ui-primary: #44dd88;
        --ui-text: #f5f5f5;
        --ui-bg: #020617;
        --ui-border: #1e293b;
      }
    `)

    expect(palette.modes.light.color?.primary).toBe('#11aa55')
    expect(palette.modes.light.text?.default).toBe('#111111')
    expect(palette.modes.dark.bg?.default).toBe('#020617')
    expect(palette.modes.dark.ui?.border).toBe('#1e293b')
  })

  it('imports palettes from exported theme modules', () => {
    const palette = normalizeImportedPaletteFromText(`
      export const theme = {
        light: {
          "--ui-primary": "#11aa55",
          "--ui-text": "#111111",
          "--ui-bg": "#f8fafc",
          "--ui-border": "#cbd5e1"
        },
        dark: {
          "--ui-primary": "#44dd88",
          "--ui-text": "#f5f5f5",
          "--ui-bg": "#020617",
          "--ui-border": "#1e293b"
        }
      }

      export const components =
      {
        "button": {
          "variants": {
            "solid": {
              "primary": {
                "bg": "var(--ui-primary)"
              }
            }
          }
        }
      }
    `)

    expect(palette.modes.light.color?.primary).toBe('#11aa55')
    expect(palette.modes.dark.text?.default).toBe('#f5f5f5')
    expect(palette.modes.light.ui?.border).toBe('#cbd5e1')
    expect(palette.components?.button?.variants?.solid?.primary?.bg).toBe('var(--ui-primary)')
  })
})
