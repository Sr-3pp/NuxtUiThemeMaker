import { describe, expect, it } from 'vitest'
import type { PaletteDefinition } from '../../app/types/palette'
import { auditPaletteTheme } from '../../app/utils/palette-qa'

function createPalette(overrides?: Partial<PaletteDefinition>): PaletteDefinition {
  return {
    name: 'QA Baseline',
    modes: {
      light: {
        color: {
          primary: '#2563eb',
          secondary: '#d97706',
          success: '#15803d',
          info: '#0284c7',
          warning: '#ca8a04',
          error: '#dc2626',
        },
        text: {
          default: '#0f172a',
          dimmed: '#64748b',
          muted: '#475569',
          highlighted: '#020617',
          inverted: '#ffffff',
        },
        bg: {
          default: '#f8fafc',
          muted: '#f1f5f9',
          elevated: '#ffffff',
          inverted: '#020617',
        },
        ui: {
          border: '#cbd5e1',
          ring: '#0f172a',
        },
      },
      dark: {
        color: {
          primary: '#60a5fa',
          secondary: '#facc15',
          success: '#4ade80',
          info: '#38bdf8',
          warning: '#fbbf24',
          error: '#f87171',
        },
        text: {
          default: '#f1f5f9',
          dimmed: '#94a3b8',
          muted: '#cbd5e1',
          highlighted: '#ffffff',
          inverted: '#020617',
        },
        bg: {
          default: '#020617',
          muted: '#0b1220',
          elevated: '#111827',
          inverted: '#f8fafc',
        },
        ui: {
          border: '#334155',
          ring: '#f1f5f9',
        },
      },
    },
    ...overrides,
  }
}

describe('palette QA audit', () => {
  it('returns a healthy score for an accessible baseline palette', () => {
    const report = auditPaletteTheme(createPalette())

    expect(report.status).toBe('healthy')
    expect(report.score).toBeGreaterThanOrEqual(85)
    expect(report.counts.critical).toBe(0)
    expect(report.readiness.find(item => item.id === 'critical-tokens')?.passed).toBe(true)
    expect(report.readiness.find(item => item.id === 'contrast-aa')?.passed).toBe(true)
    expect(report.readiness.find(item => item.id === 'focus-visibility')?.passed).toBe(true)
  })

  it('flags low-contrast text and weak focus visibility', () => {
    const report = auditPaletteTheme(createPalette({
      modes: {
        light: {
          color: {
            primary: '#dbeafe',
            secondary: '#e0f2fe',
            success: '#dcfce7',
            info: '#dbeafe',
            warning: '#fef3c7',
            error: '#fee2e2',
          },
          text: {
            default: '#94a3b8',
            dimmed: '#cbd5e1',
            muted: '#a8b4c3',
            highlighted: '#94a3b8',
            inverted: '#ffffff',
          },
          bg: {
            default: '#f8fafc',
            muted: '#f1f5f9',
            elevated: '#ffffff',
            inverted: '#020617',
          },
          ui: {
            border: '#e2e8f0',
            ring: '#e2e8f0',
          },
        },
        dark: {
          color: {
            primary: '#dbeafe',
            secondary: '#e0f2fe',
            success: '#dcfce7',
            info: '#dbeafe',
            warning: '#fef3c7',
            error: '#fee2e2',
          },
          text: {
            default: '#9ca3af',
            dimmed: '#6b7280',
            muted: '#94a3b8',
            highlighted: '#9ca3af',
            inverted: '#020617',
          },
          bg: {
            default: '#111827',
            muted: '#1f2937',
            elevated: '#111827',
            inverted: '#f8fafc',
          },
          ui: {
            border: '#cbd5e1',
            ring: '#cbd5e1',
          },
        },
      },
    }))

    expect(report.status).toBe('risky')
    expect(report.counts.critical).toBeGreaterThan(0)
    expect(report.issues.some(issue => issue.category === 'contrast')).toBe(true)
    expect(report.issues.some(issue => issue.category === 'focus')).toBe(true)
  })

  it('flags incomplete component overrides and missing required tokens', () => {
    const palette = createPalette()
    delete (palette.modes.dark.ui as Record<string, string | undefined>).ring
    palette.components = {
      button: {
        variants: {
          solid: {
            primary: {
              bg: 'var(--ui-primary)',
            },
          },
        },
      },
      input: {
        base: {
          bg: 'var(--ui-bg-elevated)',
          text: 'var(--ui-text)',
        },
      },
    }

    const report = auditPaletteTheme(palette)

    expect(report.issues.some(issue => issue.id === 'missing-dark-ui-ring')).toBe(true)
    expect(report.issues.some(issue => issue.id === 'button-solid-primary-incomplete')).toBe(true)
    expect(report.issues.some(issue => issue.id === 'input-base-incomplete')).toBe(true)
    expect(report.readiness.find(item => item.id === 'critical-tokens')?.passed).toBe(false)
  })
})
