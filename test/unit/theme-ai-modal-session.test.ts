import { computed, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import type { PaletteAiPersistedSession } from '../../app/types/palette-generation'
import {
  clearThemeAiModalSessionState,
  restoreThemeAiModalSessionState,
  syncThemeAiModalPersistedSession,
} from '../../app/utils/theme-ai-modal-session'

vi.mock('~/utils/palette-ai-session', async () => {
  const actual = await vi.importActual<typeof import('../../app/utils/palette-ai-session')>('../../app/utils/palette-ai-session')

  return actual
})

function createSessionState() {
  return {
    starterHistory: ref([{ id: 1, label: 'Starter', createdAt: '2026-04-08T10:00:00.000Z', result: { name: 'Starter', modes: { light: { ui: { primary: '#111111', secondary: '#222222', neutral: '#333333', success: '#444444', info: '#555555', warning: '#666666', error: '#777777' }, color: { primary: '#111111', secondary: '#222222', neutral: '#333333', success: '#444444', info: '#555555', warning: '#666666', error: '#777777' } }, dark: { ui: { primary: '#aaaaaa', secondary: '#bbbbbb', neutral: '#cccccc', success: '#dddddd', info: '#eeeeee', warning: '#999999', error: '#888888' }, color: { primary: '#aaaaaa', secondary: '#bbbbbb', neutral: '#cccccc', success: '#dddddd', info: '#eeeeee', warning: '#999999', error: '#888888' } } } } }]),
    directionsHistory: ref([]),
    rampsHistory: ref([]),
    variantsHistory: ref([]),
    starterResult: ref<{ name: string, modes: Record<string, unknown> } | null>(null),
    directionsResult: ref(null),
    rampsResult: ref(null),
    variantsResult: ref(null),
    historyId: ref(1),
  }
}

describe('theme AI modal session utils', () => {
  it('clears the in-memory session state', () => {
    const state = createSessionState()
    state.starterResult.value = state.starterHistory.value[0]!.result

    clearThemeAiModalSessionState(state)

    expect(state.starterHistory.value).toEqual([])
    expect(state.starterResult.value).toBeNull()
  })

  it('restores persisted state for the active palette session', () => {
    const state = createSessionState()
    const persistedSessions = ref<Record<string, PaletteAiPersistedSession>>({
      'palette-1': {
        starter: {
          items: state.starterHistory.value,
          selectedId: 1,
        },
        directions: { items: [], selectedId: null },
        ramps: { items: [], selectedId: null },
        variants: { items: [], selectedId: null },
      },
    })

    clearThemeAiModalSessionState(state)
    restoreThemeAiModalSessionState(state, persistedSessions, 'palette-1')

    expect(state.starterHistory.value).toHaveLength(1)
    expect(state.starterResult.value?.name).toBe('Starter')
    expect(state.historyId.value).toBe(1)
  })

  it('syncs the current in-memory selection into persisted storage', () => {
    const state = createSessionState()
    state.starterResult.value = state.starterHistory.value[0]!.result
    const persistedSessions = ref<Record<string, PaletteAiPersistedSession>>({})

    syncThemeAiModalPersistedSession(state, persistedSessions, 'palette-1')

    expect(persistedSessions.value['palette-1']?.starter.items).toHaveLength(1)
    expect(persistedSessions.value['palette-1']?.starter.selectedId).toBe(1)
  })

  it('does nothing when no session key is available', () => {
    const state = createSessionState()
    const persistedSessions = ref<Record<string, PaletteAiPersistedSession>>({})
    const sessionKey = computed(() => null)

    syncThemeAiModalPersistedSession(state, persistedSessions, sessionKey.value)

    expect(persistedSessions.value).toEqual({})
  })
})
