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

export function clearThemeAiModalSessionState(state: ThemeAiModalSessionState) {
  state.auditResult.value = null
  state.starterResult.value = null
  state.directionsResult.value = null
  state.rampsResult.value = null
  state.variantsResult.value = null
  state.starterHistory.value = []
  state.auditHistory.value = []
  state.directionsHistory.value = []
  state.rampsHistory.value = []
  state.variantsHistory.value = []
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

  state.starterHistory.value = restoredSession.starterHistory
  state.auditHistory.value = restoredSession.auditHistory
  state.directionsHistory.value = restoredSession.directionsHistory
  state.rampsHistory.value = restoredSession.rampsHistory
  state.variantsHistory.value = restoredSession.variantsHistory
  state.starterResult.value = restoredSession.starterResult
  state.auditResult.value = restoredSession.auditResult
  state.directionsResult.value = restoredSession.directionsResult
  state.rampsResult.value = restoredSession.rampsResult
  state.variantsResult.value = restoredSession.variantsResult
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

  persistedSessions.value[sessionKey] = buildPaletteAiPersistedSession({
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
  })
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

  watch([
    paletteSessionKey,
    state.starterHistory,
    state.auditHistory,
    state.directionsHistory,
    state.rampsHistory,
    state.variantsHistory,
    state.starterResult,
    state.auditResult,
    state.directionsResult,
    state.rampsResult,
    state.variantsResult,
  ], () => {
    syncThemeAiModalPersistedSession(state, persistedSessions, paletteSessionKey.value)
  }, { deep: true })
}
