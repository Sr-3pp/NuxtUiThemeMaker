import type { ComputedRef, Ref } from 'vue'
import type { PaletteDefinition } from '~/types/palette'
import type {
  PaletteAiPersistedSession,
  PaletteAiResultHistoryEntry,
  PaletteAuditGenerateResult,
  PaletteDirectionsGenerateResult,
  PaletteRampGenerateResult,
  PaletteVariantGenerateResult,
} from '~/types/palette-generation'
import {
  buildPaletteAiPersistedSession,
  createEmptyPersistedAiSession,
  restorePaletteAiSession,
} from '~/utils/palette-ai-session'

export interface ThemeAiModalSessionState {
  starterHistory: Ref<PaletteAiResultHistoryEntry<PaletteDefinition>[]>
  auditHistory: Ref<PaletteAiResultHistoryEntry<PaletteAuditGenerateResult>[]>
  directionsHistory: Ref<PaletteAiResultHistoryEntry<PaletteDirectionsGenerateResult>[]>
  rampsHistory: Ref<PaletteAiResultHistoryEntry<PaletteRampGenerateResult>[]>
  variantsHistory: Ref<PaletteAiResultHistoryEntry<PaletteVariantGenerateResult>[]>
  starterResult: Ref<PaletteDefinition | null>
  auditResult: Ref<PaletteAuditGenerateResult | null>
  directionsResult: Ref<PaletteDirectionsGenerateResult | null>
  rampsResult: Ref<PaletteRampGenerateResult | null>
  variantsResult: Ref<PaletteVariantGenerateResult | null>
  historyId: Ref<number>
}

const sessionTabs = ['starter', 'audit', 'directions', 'ramps', 'variants'] as const

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
    auditHistory: state.auditHistory.value,
    auditResult: state.auditResult.value,
    directionsHistory: state.directionsHistory.value,
    directionsResult: state.directionsResult.value,
    rampsHistory: state.rampsHistory.value,
    rampsResult: state.rampsResult.value,
    variantsHistory: state.variantsHistory.value,
    variantsResult: state.variantsResult.value,
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
  activeTab: Ref<'starter' | 'audit' | 'directions' | 'ramps' | 'variants'>,
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
