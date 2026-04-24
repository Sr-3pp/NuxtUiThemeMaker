import { describe, expect, it } from 'vitest'
import {
  exportPaletteAppConfig,
  exportPaletteBundleTs,
  exportPaletteCss,
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

    // Should include all export constants
    expect(output).toContain('export const theme =')
    expect(output).toContain('export const components =')
    expect(output).toContain('export const ui =')
    
    // Should include component data
    expect(output).toContain('"button"')
    expect(output).toContain('"compoundVariants"')
    expect(output).toContain('"class": "bg-primary"')
    expect(output).toContain('"--ui-primary": "#11aa55"')
    
    // ui export should have proper Nuxt UI structure with nested theme
    const uiMatch = output.match(/export const ui = \n([\s\S]+)$/)
    expect(uiMatch).toBeTruthy()
    const uiContent = JSON.parse(uiMatch![1])
    expect(uiContent.theme).toBeDefined()
    expect(uiContent.theme.light).toBeDefined()
    expect(uiContent.theme.dark).toBeDefined()
    expect(uiContent.button).toBeDefined()
    expect(uiContent.button.compoundVariants).toEqual([
      {
        variant: 'solid',
        color: 'primary',
        class: 'bg-primary',
      },
    ])
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

    expect(output).toContain("import { ui } from './theme'")
    expect(output).toContain('  ui,')
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

    // Only exports components, not theme or full ui config
    expect(output).toContain('export const components =')
    expect(output).toContain('"input"')
    expect(output).toContain('"border": "var(--ui-border)"')
    
    // Should NOT include generatedUi or ui (components export is standalone)
    expect(output).not.toContain('export const ui =')
    expect(output).not.toContain('export const theme =')
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
    expect(output).toContain("import { ui } from './theme'")
    expect(output).toContain('  ui,')
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

    // Should include all exports
    expect(output).toContain('export const theme = {')
    expect(output).toContain('export const ui =')
    expect(output).toContain('export const components =')
    
    // Should include defineAppConfig wrapper
    expect(output).toContain('export default defineAppConfig({')
    expect(output).toContain('  ui,')
    expect(output).toContain('"--ui-color-primary-500": "#11aa55"')
    
    // Verify ui structure includes theme and components
    const uiMatch = output.match(/export const ui = \n([\s\S]+?)\n\nexport default/)
    expect(uiMatch).toBeTruthy()
    const uiContent = JSON.parse(uiMatch![1])
    expect(uiContent.theme).toBeDefined()
    expect(uiContent.button).toBeDefined()
    expect(uiContent.button.compoundVariants).toEqual([
      {
        variant: 'solid',
        color: 'primary',
        class: 'bg-primary',
      },
    ])
  })

  it('includes normalized ramps in the CSS export', () => {
    const output = exportPaletteCss({
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
    })

    expect(output).toContain(':root {')
    expect(output).toContain('--ui-primary: #11aa55;')
    expect(output).toContain('--ui-color-primary-50:')
    expect(output).toContain('--ui-color-primary-500: #11aa55;')
    expect(output).toContain('--ui-color-primary-950:')
    expect(output).toContain('.dark {')
    expect(output).toContain('--ui-primary: #44dd88;')
  })
})
