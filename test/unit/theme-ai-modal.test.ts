import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, nextTick, ref, watch } from 'vue'
import type { EditablePalette } from '../../app/types/palette-editor'
import type {
  PaletteAiPersistedSession,
  PaletteAuditGenerateResult,
} from '../../app/types/palette-generation'

vi.mock('~/utils/palette-domain', async () => {
  const actual = await vi.importActual<typeof import('../../app/utils/palette-domain')>('../../app/utils/palette-domain')

  return actual
})

vi.mock('~/utils/palette-ai-session', async () => {
  const actual = await vi.importActual<typeof import('../../app/utils/palette-ai-session')>('../../app/utils/palette-ai-session')

  return actual
})

vi.mock('~/utils/component-theme-editor', async () => {
  const actual = await vi.importActual<typeof import('../../app/utils/component-theme-editor')>('../../app/utils/component-theme-editor')

  return actual
})

vi.mock('~/utils/theme-ai-modal-history', async () => {
  const actual = await vi.importActual<typeof import('../../app/utils/theme-ai-modal-history')>('../../app/utils/theme-ai-modal-history')

  return actual
})

vi.mock('~/utils/theme-ai-modal-starter', async () => {
  const actual = await vi.importActual<typeof import('../../app/utils/theme-ai-modal-starter')>('../../app/utils/theme-ai-modal-starter')

  return actual
})

vi.mock('~/utils/theme-ai-modal-session', async () => {
  const actual = await vi.importActual<typeof import('../../app/utils/theme-ai-modal-session')>('../../app/utils/theme-ai-modal-session')

  return actual
})

function createEditablePalette(): EditablePalette {
  return {
    _id: 'palette-1',
    userId: 'user-1',
    slug: 'forest-glow',
    name: 'Forest Glow',
    isPublic: true,
    createdAt: '2026-03-20T00:00:00.000Z',
    updatedAt: '2026-03-20T01:00:00.000Z',
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
        color: {
          primary: '#11aa55',
          secondary: '#2255aa',
          neutral: '#888888',
          success: '#00aa66',
          info: '#0088ff',
          warning: '#ffaa00',
          error: '#ff3355',
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
        color: {
          primary: '#44dd88',
          secondary: '#6699ff',
          neutral: '#aaaaaa',
          success: '#22dd88',
          info: '#55bbff',
          warning: '#ffcc55',
          error: '#ff6677',
        },
      },
    },
  }
}

function createGeneratedPalette(name = 'AI Direction') {
  return {
    name,
    modes: {
      light: {
        ui: {
          primary: '#101010',
          secondary: '#202020',
          neutral: '#303030',
          success: '#404040',
          info: '#505050',
          warning: '#606060',
          error: '#707070',
        },
        color: {
          primary: '#101010',
          secondary: '#202020',
          neutral: '#303030',
          success: '#404040',
          info: '#505050',
          warning: '#606060',
          error: '#707070',
        },
      },
      dark: {
        ui: {
          primary: '#f0f0f0',
          secondary: '#e0e0e0',
          neutral: '#d0d0d0',
          success: '#c0c0c0',
          info: '#b0b0b0',
          warning: '#a0a0a0',
          error: '#909090',
        },
        color: {
          primary: '#f0f0f0',
          secondary: '#e0e0e0',
          neutral: '#d0d0d0',
          success: '#c0c0c0',
          info: '#b0b0b0',
          warning: '#a0a0a0',
          error: '#909090',
        },
      },
    },
  }
}

describe('useThemeAiModal', () => {
  const toastAddMock = vi.fn()
  const showErrorToastMock = vi.fn()
  const generatePaletteMock = vi.fn()
  const generatePaletteAuditMock = vi.fn()
  const generatePaletteDirectionsMock = vi.fn()
  const generatePaletteRampsMock = vi.fn()
  const generatePaletteVariantsMock = vi.fn()
  const applyGeneratedPaletteMock = vi.fn()
  const applyGeneratedComponentsMock = vi.fn()
  const applyGeneratedRampsMock = vi.fn()
  const refreshAccessMock = vi.fn()

  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()

    const stateMap = new Map<string, { value: unknown }>()

    vi.stubGlobal('useState', (key: string, init: () => unknown) => {
      if (!stateMap.has(key)) {
        stateMap.set(key, { value: init() })
      }

      return stateMap.get(key)
    })
    vi.stubGlobal('ref', ref)
    vi.stubGlobal('computed', computed)
    vi.stubGlobal('watch', watch)

    vi.stubGlobal('useToast', () => ({
      add: toastAddMock,
    }))
    vi.stubGlobal('useErrorToast', () => ({
      showErrorToast: showErrorToastMock,
    }))
    vi.stubGlobal('usePaletteApi', () => ({
      generatePalette: generatePaletteMock,
      generatePaletteAudit: generatePaletteAuditMock,
      generatePaletteDirections: generatePaletteDirectionsMock,
      generatePaletteRamps: generatePaletteRampsMock,
      generatePaletteVariants: generatePaletteVariantsMock,
    }))
    vi.stubGlobal('usePaletteState', () => ({
      applyGeneratedPalette: applyGeneratedPaletteMock,
      applyGeneratedComponents: applyGeneratedComponentsMock,
      applyGeneratedRamps: applyGeneratedRampsMock,
    }))
    vi.stubGlobal('usePaletteGenerationAccess', () => ({
      isDisabled: ref(false),
      helperText: ref(''),
      cta: ref(null),
      refresh: refreshAccessMock,
    }))
  })

  it('restores persisted history for the current palette session', async () => {
    const restoredResult = createGeneratedPalette('Restored Starter')
    const persistedSession: PaletteAiPersistedSession = {
      starter: {
        items: [{
          id: 7,
          label: 'Restored Starter',
          detail: 'Saved run',
          createdAt: '2026-04-08T12:00:00.000Z',
          result: restoredResult,
        }],
        selectedId: 7,
      },
      audit: { items: [], selectedId: null },
      directions: { items: [], selectedId: null },
      ramps: { items: [], selectedId: null },
      variants: { items: [], selectedId: null },
    }

    const sessions = {
      'palette-1': persistedSession,
    }
    vi.stubGlobal('useState', () => ({ value: sessions }))

    const { useThemeAiModal } = await import('../../app/composables/useThemeAiModal')
    const modal = useThemeAiModal(ref(false), ref(createEditablePalette()))

    await nextTick()

    expect(modal.starterHistory.value).toHaveLength(1)
    expect(modal.starterResult.value?.name).toBe('Restored Starter')
    expect(modal.getSelectedHistoryId(modal.starterHistory.value, modal.starterResult.value)).toBe(7)
  })

  it('rejects invalid and duplicate starter brand colors with warning toasts', async () => {
    const { useThemeAiModal } = await import('../../app/composables/useThemeAiModal')
    const modal = useThemeAiModal(ref(false), ref(createEditablePalette()))

    modal.starterBrandInput.value = 'not-a-color'
    modal.addStarterBrandColor()

    modal.starterBrandInput.value = '#0EA5E9'
    modal.addStarterBrandColor()
    modal.starterBrandInput.value = '#0ea5e9'
    modal.addStarterBrandColor()

    expect(modal.starterBrandColors.value).toEqual(['#0ea5e9'])
    expect(toastAddMock).toHaveBeenCalledTimes(2)
    expect(toastAddMock).toHaveBeenNthCalledWith(1, expect.objectContaining({
      title: 'Invalid brand color',
      color: 'warning',
    }))
    expect(toastAddMock).toHaveBeenNthCalledWith(2, expect.objectContaining({
      title: 'Duplicate brand color',
      color: 'warning',
    }))
  })

  it('generates a starter theme, records history, and applies the suggestion', async () => {
    const result = createGeneratedPalette('Coastal Ledger')
    generatePaletteMock.mockResolvedValueOnce(result)

    const { useThemeAiModal } = await import('../../app/composables/useThemeAiModal')
    const open = ref(true)
    const modal = useThemeAiModal(open, ref(createEditablePalette()))

    modal.starterPrompt.value = 'Ocean dashboard'

    await modal.handleStarterTheme()

    expect(generatePaletteMock).toHaveBeenCalledWith({
      prompt: 'Ocean dashboard',
      brandColors: undefined,
      referenceSummary: undefined,
      referenceImage: undefined,
    })
    expect(modal.starterResult.value?.name).toBe('Coastal Ledger')
    expect(modal.starterHistory.value).toHaveLength(1)
    expect(modal.starterHistory.value[0]?.label).toBe('Coastal Ledger')
    expect(modal.starterHistory.value[0]?.detail).toBe('Ocean dashboard')

    modal.applyPaletteSuggestion(result, 'Applied the generated starter theme to the current draft.')

    expect(applyGeneratedPaletteMock).toHaveBeenCalledWith(result)
    expect(toastAddMock).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Palette updated',
      color: 'success',
    }))
    expect(open.value).toBe(false)
  })

  it('generates audit repairs and persists the latest selected audit result', async () => {
    const auditResult: PaletteAuditGenerateResult = {
      summary: 'Improved contrast and focus states',
      fixes: [{
        token: 'primary',
        mode: 'light',
        currentValue: '#11aa55',
        suggestedValue: '#0f8a44',
        reason: 'Increase contrast on action surfaces.',
      }],
      patchedPalette: createGeneratedPalette('Patched Palette'),
    }
    generatePaletteAuditMock.mockResolvedValueOnce(auditResult)

    const { useThemeAiModal } = await import('../../app/composables/useThemeAiModal')
    const modal = useThemeAiModal(ref(true), ref(createEditablePalette()))

    modal.auditPrompt.value = 'Improve contrast'

    await modal.handleAudit()
    await nextTick()

    expect(generatePaletteAuditMock).toHaveBeenCalledWith(expect.objectContaining({
      prompt: 'Improve contrast',
    }))
    expect(modal.auditResult.value?.summary).toBe('Improved contrast and focus states')
    expect(modal.auditHistory.value).toHaveLength(1)
    expect(modal.getSelectedHistoryId(modal.auditHistory.value, modal.auditResult.value)).toBe(modal.auditHistory.value[0]?.id ?? null)
  })
})
