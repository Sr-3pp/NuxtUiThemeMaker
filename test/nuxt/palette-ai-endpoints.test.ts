import { createEvent, type H3Event } from 'h3'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const getOptionalAuthSessionMock = vi.fn()
const assertPaletteGenerationAllowedMock = vi.fn()
const incrementPaletteGenerationUsageIfNeededMock = vi.fn()
const generateContentMock = vi.fn()
const getPaletteQaReportMock = vi.fn()

vi.mock('~~/server/utils/auth-session', () => ({
  getOptionalAuthSession: getOptionalAuthSessionMock,
}))

vi.mock('~~/server/services/palette-generation-access', () => ({
  assertPaletteGenerationAllowed: assertPaletteGenerationAllowedMock,
  incrementPaletteGenerationUsageIfNeeded: incrementPaletteGenerationUsageIfNeededMock,
}))

vi.mock('~~/server/services/palette-qa-service', () => ({
  getPaletteQaReport: getPaletteQaReportMock,
}))

vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = {
      generateContent: generateContentMock,
    }
  },
}))

function createPostEvent(url: string, body: Record<string, unknown>) {
  const headers = new Map<string, string>()

  return createEvent({
    method: 'POST',
    url,
    headers: {
      'content-type': 'application/json',
    },
    body,
  } as never, {
    writableEnded: false,
    headersSent: false,
    setHeader(name: string, value: string) {
      headers.set(name.toLowerCase(), value)
    },
    getHeader(name: string) {
      return headers.get(name.toLowerCase())
    },
  } as never)
}

const session = {
  user: {
    id: 'user-1',
    isAdmin: false,
    plan: 'free',
    planStatus: 'inactive',
    aiPaletteGenerationsUsed: 0,
  },
}

const access = {
  canGenerate: true,
  isPaidUnlimited: false,
  isAdminUnlimited: false,
  freeLimit: 3,
  freeUsed: 0,
  freeRemaining: 3,
  reason: 'allowed',
}

const basePalette = {
  name: 'Baseline',
  modes: {
    light: {
      color: { primary: '#2563eb', secondary: '#d97706', success: '#15803d', info: '#0284c7', warning: '#ca8a04', error: '#dc2626' },
      text: { default: '#0f172a', dimmed: '#64748b', muted: '#475569', toned: '#334155', highlighted: '#020617', inverted: '#ffffff' },
      bg: { default: '#f8fafc', muted: '#f1f5f9', elevated: '#ffffff', accented: '#dbeafe', inverted: '#020617' },
      ui: { border: '#cbd5e1', 'border-muted': '#e2e8f0', 'border-accented': '#2563eb', ring: '#1d4ed8' },
      radius: { default: '4px', sm: '2px', md: '6px', lg: '8px', xl: '12px' },
    },
    dark: {
      color: { primary: '#60a5fa', secondary: '#fbbf24', success: '#4ade80', info: '#38bdf8', warning: '#facc15', error: '#f87171' },
      text: { default: '#f8fafc', dimmed: '#cbd5e1', muted: '#94a3b8', toned: '#e2e8f0', highlighted: '#ffffff', inverted: '#020617' },
      bg: { default: '#020617', muted: '#0f172a', elevated: '#111827', accented: '#1e3a8a', inverted: '#f8fafc' },
      ui: { border: '#334155', 'border-muted': '#1e293b', 'border-accented': '#60a5fa', ring: '#93c5fd' },
      radius: { default: '4px', sm: '2px', md: '6px', lg: '8px', xl: '12px' },
    },
  },
}

describe('phase 7 AI palette endpoints', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    getOptionalAuthSessionMock.mockResolvedValue(session)
    assertPaletteGenerationAllowedMock.mockReturnValue(access)
    process.env.NUXT_GEMINI_API_KEY = 'test-key'
  })

  it('generates structured ramps from brand colors', async () => {
    generateContentMock.mockResolvedValueOnce({
      text: JSON.stringify({
        paletteName: 'Signal Stack',
        ramps: {
          primary: {
            '50': '#eff6ff',
            '100': '#dbeafe',
            '200': '#bfdbfe',
            '300': '#93c5fd',
            '400': '#60a5fa',
            '500': '#3b82f6',
            '600': '#2563eb',
            '700': '#1d4ed8',
            '800': '#1e40af',
            '900': '#1e3a8a',
            '950': '#172554',
          },
        },
      }),
    })

    const { default: handler } = await import('~~/server/api/palettes/generate/ramp.post')
    const result = await handler(createPostEvent('/api/palettes/generate/ramp', {
      paletteName: 'Signal Stack',
      brandColors: ['#3b82f6'],
      prompt: 'Fintech with crisp status ramps',
    }) as H3Event)

    expect(result).toMatchObject({
      paletteName: 'Signal Stack',
      ramps: {
        primary: {
          '500': '#3b82f6',
        },
      },
    })
    expect(generateContentMock).toHaveBeenCalledWith(expect.objectContaining({
      contents: [expect.stringContaining('Brand colors: #3b82f6.')],
    }))
    expect(incrementPaletteGenerationUsageIfNeededMock).toHaveBeenCalledWith(session, access)
  })

  it('generates contrast repair suggestions and a patched palette', async () => {
    getPaletteQaReportMock.mockReturnValueOnce({
      score: 61,
      status: 'risky',
      issues: [{
        id: 'body-default-light',
        category: 'contrast',
        severity: 'critical',
        mode: 'light',
        title: 'Body text on default surface',
        description: 'light mode falls below 4.5:1.',
        tokens: ['text.default', 'bg.default'],
        actual: 2.9,
        minimum: 4.5,
      }],
      readiness: [],
      counts: {
        critical: 1,
        warning: 0,
        info: 0,
      },
    })
    generateContentMock.mockResolvedValueOnce({
      text: JSON.stringify({
        summary: 'Darkened reading text and strengthened focus tokens.',
        fixes: [{
          token: 'text.default',
          mode: 'light',
          currentValue: '#94a3b8',
          suggestedValue: '#0f172a',
          reason: 'Raises body copy contrast on the default background.',
        }],
        patchedPalette: basePalette,
      }),
    })

    const { default: handler } = await import('~~/server/api/palettes/generate/audit.post')
    const result = await handler(createPostEvent('/api/palettes/generate/audit', {
      palette: basePalette,
    }) as H3Event)

    expect(result).toMatchObject({
      summary: 'Darkened reading text and strengthened focus tokens.',
      fixes: [{
        token: 'text.default',
        mode: 'light',
        suggestedValue: '#0f172a',
      }],
      patchedPalette: {
        name: 'Baseline',
      },
    })
    expect(generateContentMock).toHaveBeenCalledWith(expect.objectContaining({
      contents: [expect.stringContaining('"issues":[{"id":"body-default-light"')],
    }))
  })

  it('normalizes string-based audit fixes and falls back to the submitted palette', async () => {
    getPaletteQaReportMock.mockReturnValueOnce({
      score: 78,
      status: 'warning',
      issues: [{
        id: 'semantic-hierarchy',
        category: 'semantic-mapping',
        severity: 'warning',
        mode: 'shared',
        title: 'Semantic mapping',
        description: 'Accent colors stay visible on the main surface and preserve hierarchy.',
        tokens: ['bg.accented', 'color.primary'],
      }],
      readiness: [],
      counts: {
        critical: 0,
        warning: 1,
        info: 0,
      },
    })
    generateContentMock.mockResolvedValueOnce({
      text: JSON.stringify({
        summary: 'Reduced accent bleed on the main surface.',
        fixes: [
          'light bg.accented: shift this surface away from the primary hue so accents remain special.',
          'shared color.primary: keep brand emphasis concentrated in actions instead of default surfaces.',
        ],
      }),
    })

    const { default: handler } = await import('~~/server/api/palettes/generate/audit.post')
    const result = await handler(createPostEvent('/api/palettes/generate/audit', {
      palette: basePalette,
    }) as H3Event)

    expect(result).toMatchObject({
      summary: 'Reduced accent bleed on the main surface.',
      fixes: [
        {
          token: 'bg.accented',
          mode: 'light',
        },
        {
          token: 'color.primary',
          mode: 'shared',
        },
      ],
      patchedPalette: {
        name: 'Baseline',
      },
    })
  })

  it('generates alternative directions from an existing palette', async () => {
    generateContentMock.mockResolvedValueOnce({
      text: JSON.stringify({
        directions: [
          {
            name: 'Signal Night',
            rationale: 'Pushes the palette toward a deeper ops-console mood.',
            palette: basePalette,
          },
          {
            name: 'Market Paper',
            rationale: 'Softens surfaces for an editorial data product feel.',
            palette: basePalette,
          },
        ],
      }),
    })

    const { default: handler } = await import('~~/server/api/palettes/generate/directions.post')
    const result = await handler(createPostEvent('/api/palettes/generate/directions', {
      palette: basePalette,
      count: 2,
      prompt: 'Explore more editorial and more command-center directions.',
    }) as H3Event)

    expect(result).toMatchObject({
      directions: [
        { name: 'Signal Night' },
        { name: 'Market Paper' },
      ],
    })
    expect(generateContentMock).toHaveBeenCalledWith(expect.objectContaining({
      contents: [expect.stringContaining('Generate 2 alternative theme directions.')],
    }))
  })
})
