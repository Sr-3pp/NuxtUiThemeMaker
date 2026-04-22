import type { ComputedRef, Ref } from 'vue'
import type { PaletteDefinition } from '~/types/palette'
import type {
  PaletteAiPersistedSession,
  PaletteAiResultHistoryEntry,
  PaletteDirectionsGenerateResult,
  PaletteRampGenerateResult,
} from '~/types/palette-generation'
import {
  buildPaletteAiPersistedSession,
  createEmptyPersistedAiSession,
  restorePaletteAiSession,
} from '~/utils/palette-ai-session'

export interface ThemeAiModalSessionState {
  starterHistory: Ref<PaletteAiResultHistoryEntry<PaletteDefinition>[]>
  directionsHistory: Ref<PaletteAiResultHistoryEntry<PaletteDirectionsGenerateResult>[]>
  rampsHistory: Ref<PaletteAiResultHistoryEntry<PaletteRampGenerateResult>[]>
  starterResult: Ref<PaletteDefinition | null>
  directionsResult: Ref<PaletteDirectionsGenerateResult | null>
  rampsResult: Ref<PaletteRampGenerateResult | null>
  historyId: Ref<number>
}

const sessionTabs = ['starter', 'directions', 'ramps'] as const

type ThemeAiSessionTab = typeof sessionTabs[number]
type ThemeAiSessionRestoredKey = `${ThemeAiSessionTab}${'History' | 'Result'}`
type ThemeAiSessionStateKey = `${ThemeAiSessionTab}${'History' | 'Result'}`

function assignSessionTabState(
  state: ThemeAiModalSessionState,
  restoredSession: ReturnType<typeof restorePaletteAiSession>,
  tab: ThemeAiSessionTab,
) {
  state[`${tab}History` as ThemeAiSessionStateKey].value = restoredSession[`${tab}History` as ThemeAiSessionRestoredKey]
  state[`${tab}Result` as ThemeAiSessionStateKey].value = restoredSession[`${tab}Result` as ThemeAiSessionRestoredKey]
}

function clearSessionTabState(
  state: ThemeAiModalSessionState,
  tab: ThemeAiSessionTab,
) {
  state[`${tab}History` as ThemeAiSessionStateKey].value = []
  state[`${tab}Result` as ThemeAiSessionStateKey].value = null
}

function buildPersistedSessionPayload(state: ThemeAiModalSessionState) {
  return {
    starterHistory: state.starterHistory.value,
    starterResult: state.starterResult.value,
    directionsHistory: state.directionsHistory.value,
    directionsResult: state.directionsResult.value,
    rampsHistory: state.rampsHistory.value,
    rampsResult: state.rampsResult.value,
  }
}

function getSessionPersistenceSources(
  paletteSessionKey: ComputedRef<string | null>,
  state: ThemeAiModalSessionState,
) {
  return [
    paletteSessionKey,
    ...sessionTabs.flatMap(tab => [
      state[`${tab}History` as ThemeAiSessionStateKey],
      state[`${tab}Result` as ThemeAiSessionStateKey],
    ]),
  ]
}

export function clearThemeAiModalSessionState(state: ThemeAiModalSessionState) {
  sessionTabs.forEach(tab => clearSessionTabState(state, tab))
}

export function restoreThemeAiModalSessionState(
  state: ThemeAiModalSessionState,
  persistedSessions: Ref<Record<string, PaletteAiPersistedSession>>,
  sessionKey: string | null,
) {
  if (!sessionKey) {
    clearThemeAiModalSessionState(state)
    return
  }

  const restoredSession = restorePaletteAiSession(persistedSessions.value[sessionKey] ?? createEmptyPersistedAiSession())

  sessionTabs.forEach(tab => assignSessionTabState(state, restoredSession, tab))
  state.historyId.value = restoredSession.historyId
}

export function syncThemeAiModalPersistedSession(
  state: ThemeAiModalSessionState,
  persistedSessions: Ref<Record<string, PaletteAiPersistedSession>>,
  sessionKey: string | null,
) {
  if (!sessionKey) {
    return
  }

  persistedSessions.value[sessionKey] = buildPaletteAiPersistedSession(buildPersistedSessionPayload(state))
}

export function watchThemeAiModalSessionPersistence(
  open: Ref<boolean>,
  activeTab: Ref<'starter' | 'directions' | 'ramps'>,
  paletteSessionKey: ComputedRef<string | null>,
  state: ThemeAiModalSessionState,
  persistedSessions: Ref<Record<string, PaletteAiPersistedSession>>,
) {
  watch(open, (value) => {
    if (!value) {
      activeTab.value = 'starter'
      return
    }

    restoreThemeAiModalSessionState(state, persistedSessions, paletteSessionKey.value)
  }, { immediate: false })

  watch(paletteSessionKey, () => {
    restoreThemeAiModalSessionState(state, persistedSessions, paletteSessionKey.value)
  }, { immediate: true })

  watch(getSessionPersistenceSources(paletteSessionKey, state), () => {
    syncThemeAiModalPersistedSession(state, persistedSessions, paletteSessionKey.value)
  }, { deep: true })
}
