import { describe, expect, it } from 'vitest'
import { normalizeImportedPalette, serializePaletteExport } from '../../app/utils/palette-io'

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
})
