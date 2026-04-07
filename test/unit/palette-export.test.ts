import { describe, expect, it } from 'vitest'
import {
  exportPaletteAppConfig,
  exportPaletteBundleTs,
  exportPaletteComponentsTs,
  exportPaletteInstallSnippet,
  exportPaletteTs,
} from '../../app/utils/paletteExport'

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

  it('exports component overrides as a standalone components file', () => {
    const output = exportPaletteComponentsTs({
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
        input: {
          base: {
            border: 'var(--ui-border)',
          },
        },
      },
    })

    expect(output).toContain('export const components =')
    expect(output).toContain('"input"')
    expect(output).toContain('"border": "var(--ui-border)"')
  })

  it('exports an install-ready snippet', () => {
    const output = exportPaletteInstallSnippet({
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

    expect(output).toContain('defineAppConfig')
    expect(output).toContain('theme,')
    expect(output).toContain('...components')
  })

  it('exports a self-contained Nuxt bundle', () => {
    const output = exportPaletteBundleTs({
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

    expect(output).toContain('export const theme = {')
    expect(output).toContain('export const components =')
    expect(output).toContain('export default defineAppConfig({')
    expect(output).toContain('...components')
  })
})
