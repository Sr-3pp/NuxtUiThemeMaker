import { describe, expect, it, vi } from 'vitest'
import type { PaletteDefinition } from '../../app/types/palette'
import { assertPalettePublishReady, getPaletteQaReport } from '../../server/services/palette-qa-service'

const { findPaletteByIdMock, parsePaletteObjectIdMock } = vi.hoisted(() => ({
  findPaletteByIdMock: vi.fn(),
  parsePaletteObjectIdMock: vi.fn((id: string) => `object:${id}`),
}))

vi.mock('h3', () => ({
  createError: (input: { statusCode: number, statusMessage: string, data?: unknown }) =>
    Object.assign(new Error(input.statusMessage), input),
}))

vi.mock('~~/server/db/repositories/palette-repository', () => ({
  findPaletteById: findPaletteByIdMock,
}))

vi.mock('~~/server/services/palette-helpers', () => ({
  parsePaletteObjectId: parsePaletteObjectIdMock,
}))

function createPalette(overrides?: Partial<PaletteDefinition>): PaletteDefinition {
  return {
    name: 'Publish Candidate',
    modes: {
      light: {
        color: {
          primary: '#1d4ed8',
          secondary: '#7c2d12',
          success: '#166534',
          info: '#0369a1',
          warning: '#a16207',
          error: '#b91c1c',
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

describe('palette QA service', () => {
  it('returns the shared QA report', () => {
    const report = getPaletteQaReport(createPalette())

    expect(report.score).toBeGreaterThan(0)
    expect(report.readiness.length).toBeGreaterThan(0)
  })

  it('allows publish-ready palettes', () => {
    expect(() => assertPalettePublishReady(createPalette())).not.toThrow()
  })

  it('blocks risky palettes from being published', () => {
    expect(() => assertPalettePublishReady(createPalette({
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
            default: '#cbd5e1',
            dimmed: '#cbd5e1',
            muted: '#cbd5e1',
            highlighted: '#cbd5e1',
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
            primary: '#60a5fa',
            secondary: '#facc15',
            success: '#4ade80',
            info: '#38bdf8',
            warning: '#fbbf24',
            error: '#f87171',
          },
          text: {
            default: '#475569',
            dimmed: '#475569',
            muted: '#475569',
            highlighted: '#475569',
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
            ring: '#334155',
          },
        },
      },
    }))).toThrow(/not ready to publish/i)
  })
})
