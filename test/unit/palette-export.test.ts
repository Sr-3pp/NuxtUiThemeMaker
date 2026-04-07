import { describe, expect, it } from 'vitest'
import { exportPaletteAppConfig, exportPaletteTs } from '../../app/utils/paletteExport'

describe('palette export', () => {
  it('includes component overrides in the TypeScript export', () => {
    const output = exportPaletteTs({
      name: 'Forest Glow',
      modes: {
        light: {
          color: { primary: '#11aa55' },
          ui: { primary: '#11aa55' },
        },
        dark: {
          color: { primary: '#44dd88' },
          ui: { primary: '#44dd88' },
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

    expect(output).toContain('export const components =')
    expect(output).toContain('"button"')
    expect(output).toContain('"bg": "var(--ui-primary)"')
  })

  it('references component overrides in app config export', () => {
    const output = exportPaletteAppConfig({
      name: 'Forest Glow',
      modes: {
        light: {
          color: { primary: '#11aa55' },
          ui: { primary: '#11aa55' },
        },
        dark: {
          color: { primary: '#44dd88' },
          ui: { primary: '#44dd88' },
        },
      },
      components: {},
    })

    expect(output).toContain("import { components, theme } from './theme'")
    expect(output).toContain('...components')
  })
})
