import { describe, expect, it } from 'vitest'
import type {
  PaletteAiPersistedSession,
  PaletteAuditGenerateResult,
  PaletteDirectionsGenerateResult,
  PaletteRampGenerateResult,
  PaletteVariantGenerateResult,
} from '../../app/types/palette-generation'
import type { PaletteDefinition } from '../../app/types/palette'
import {
  buildPaletteAiPersistedSession,
  createEmptyPersistedAiSession,
  restorePaletteAiSession,
} from '../../app/utils/palette-ai-session'

function createPalette(name: string): PaletteDefinition {
  return {
    name,
    modes: {
      light: {
        ui: {
          primary: '#0ea5e9',
          secondary: '#6366f1',
          neutral: '#64748b',
          success: '#22c55e',
          info: '#0ea5e9',
          warning: '#f59e0b',
          error: '#ef4444',
        },
        color: {
          primary: '#0ea5e9',
          secondary: '#6366f1',
          neutral: '#64748b',
          success: '#22c55e',
          info: '#0ea5e9',
          warning: '#f59e0b',
          error: '#ef4444',
        },
      },
      dark: {
        ui: {
          primary: '#38bdf8',
          secondary: '#818cf8',
          neutral: '#94a3b8',
          success: '#4ade80',
          info: '#38bdf8',
          warning: '#fbbf24',
          error: '#f87171',
        },
        color: {
          primary: '#38bdf8',
          secondary: '#818cf8',
          neutral: '#94a3b8',
          success: '#4ade80',
          info: '#38bdf8',
          warning: '#fbbf24',
          error: '#f87171',
        },
      },
    },
  }
}

function createAuditResult(summary: string): PaletteAuditGenerateResult {
  return {
    summary,
    fixes: [],
    patchedPalette: createPalette(`${summary} patched`),
  }
}

function createDirectionsResult(name: string): PaletteDirectionsGenerateResult {
  return {
    directions: [
      {
        name,
        rationale: `${name} rationale`,
        palette: createPalette(name),
      },
    ],
  }
}

function createRampResult(name: string): PaletteRampGenerateResult {
  return {
    paletteName: name,
    ramps: {
      primary: {
        '50': '#f0f9ff',
        '100': '#e0f2fe',
        '200': '#bae6fd',
        '300': '#7dd3fc',
        '400': '#38bdf8',
        '500': '#0ea5e9',
        '600': '#0284c7',
        '700': '#0369a1',
        '800': '#075985',
        '900': '#0c4a6e',
        '950': '#082f49',
      },
    },
  }
}

function createVariantResult(summary: string): PaletteVariantGenerateResult {
  return {
    summary,
    components: {
      button: {
        base: {
          bg: 'var(--ui-primary)',
        },
      },
    },
  }
}

describe('palette AI session helpers', () => {
  it('creates and restores an empty session', () => {
    const session = createEmptyPersistedAiSession()
    const restored = restorePaletteAiSession(session)

    expect(session.starter.items).toEqual([])
    expect(session.audit.selectedId).toBeNull()
    expect(restored.starterResult).toBeNull()
    expect(restored.auditHistory).toEqual([])
    expect(restored.historyId).toBe(0)
  })

  it('restores selected results and history id from a persisted session', () => {
    const starterA = createPalette('Starter A')
    const starterB = createPalette('Starter B')
    const auditA = createAuditResult('Audit A')
    const directionsA = createDirectionsResult('Direction A')
    const rampsA = createRampResult('Ramp A')
    const variantsA = createVariantResult('Variants A')
    const session: PaletteAiPersistedSession = {
      starter: {
        items: [
          { id: 4, label: 'Starter A', createdAt: '2026-04-08T10:00:00.000Z', detail: 'Prompt A', result: starterA },
          { id: 7, label: 'Starter B', createdAt: '2026-04-08T10:05:00.000Z', detail: 'Prompt B', result: starterB },
        ],
        selectedId: 7,
      },
      audit: {
        items: [{ id: 3, label: 'Audit A', createdAt: '2026-04-08T10:01:00.000Z', result: auditA }],
        selectedId: 3,
      },
      directions: {
        items: [{ id: 8, label: '1 direction', createdAt: '2026-04-08T10:06:00.000Z', result: directionsA }],
        selectedId: 8,
      },
      ramps: {
        items: [{ id: 2, label: '1 ramp', createdAt: '2026-04-08T09:59:00.000Z', result: rampsA }],
        selectedId: 2,
      },
      variants: {
        items: [{ id: 5, label: 'Variants A', createdAt: '2026-04-08T10:03:00.000Z', result: variantsA }],
        selectedId: 5,
      },
    }

    const restored = restorePaletteAiSession(session)

    expect(restored.starterHistory).toHaveLength(2)
    expect(restored.starterResult).toBe(starterB)
    expect(restored.auditResult).toBe(auditA)
    expect(restored.directionsResult).toBe(directionsA)
    expect(restored.rampsResult).toBe(rampsA)
    expect(restored.variantsResult).toBe(variantsA)
    expect(restored.historyId).toBe(8)
  })

  it('builds a persisted session using the selected in-memory results', () => {
    const starterA = createPalette('Starter A')
    const starterB = createPalette('Starter B')
    const auditA = createAuditResult('Audit A')
    const auditB = createAuditResult('Audit B')
    const directionsA = createDirectionsResult('Direction A')
    const rampsA = createRampResult('Ramp A')
    const variantsA = createVariantResult('Variants A')

    const session = buildPaletteAiPersistedSession({
      starterHistory: [
        { id: 1, label: 'Starter A', createdAt: '2026-04-08T10:00:00.000Z', detail: 'Prompt A', result: starterA },
        { id: 2, label: 'Starter B', createdAt: '2026-04-08T10:02:00.000Z', detail: 'Prompt B', result: starterB },
      ],
      starterResult: starterA,
      auditHistory: [
        { id: 3, label: 'Audit A', createdAt: '2026-04-08T10:01:00.000Z', result: auditA },
        { id: 4, label: 'Audit B', createdAt: '2026-04-08T10:03:00.000Z', result: auditB },
      ],
      auditResult: auditB,
      directionsHistory: [{ id: 5, label: '1 direction', createdAt: '2026-04-08T10:04:00.000Z', result: directionsA }],
      directionsResult: directionsA,
      rampsHistory: [{ id: 6, label: '1 ramp', createdAt: '2026-04-08T10:05:00.000Z', result: rampsA }],
      rampsResult: rampsA,
      variantsHistory: [{ id: 7, label: 'Variants A', createdAt: '2026-04-08T10:06:00.000Z', result: variantsA }],
      variantsResult: variantsA,
    })

    expect(session.starter.selectedId).toBe(1)
    expect(session.audit.selectedId).toBe(4)
    expect(session.directions.selectedId).toBe(5)
    expect(session.ramps.selectedId).toBe(6)
    expect(session.variants.selectedId).toBe(7)
  })
})
