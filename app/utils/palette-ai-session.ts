import type {
  PaletteAiPersistedHistoryState,
  PaletteAiPersistedSession,
  PaletteAiResultHistoryEntry,
  PaletteAuditGenerateResult,
  PaletteDirectionsGenerateResult,
  PaletteRampGenerateResult,
  PaletteVariantGenerateResult,
} from '~/types/palette-generation'
import type { PaletteDefinition } from '~/types/palette'

export interface RestoredPaletteAiSession {
  starterHistory: PaletteAiResultHistoryEntry<PaletteDefinition>[]
  auditHistory: PaletteAiResultHistoryEntry<PaletteAuditGenerateResult>[]
  directionsHistory: PaletteAiResultHistoryEntry<PaletteDirectionsGenerateResult>[]
  rampsHistory: PaletteAiResultHistoryEntry<PaletteRampGenerateResult>[]
  variantsHistory: PaletteAiResultHistoryEntry<PaletteVariantGenerateResult>[]
  starterResult: PaletteDefinition | null
  auditResult: PaletteAuditGenerateResult | null
  directionsResult: PaletteDirectionsGenerateResult | null
  rampsResult: PaletteRampGenerateResult | null
  variantsResult: PaletteVariantGenerateResult | null
  historyId: number
}

const sessionTabs = ['starter', 'audit', 'directions', 'ramps', 'variants'] as const

export function createEmptyPersistedHistoryState<T>(): PaletteAiPersistedHistoryState<T> {
  return {
    items: [],
    selectedId: null,
  }
}

export function createEmptyPersistedAiSession(): PaletteAiPersistedSession {
  return {
    starter: createEmptyPersistedHistoryState<PaletteDefinition>(),
    audit: createEmptyPersistedHistoryState<PaletteAuditGenerateResult>(),
    directions: createEmptyPersistedHistoryState<PaletteDirectionsGenerateResult>(),
    ramps: createEmptyPersistedHistoryState<PaletteRampGenerateResult>(),
    variants: createEmptyPersistedHistoryState<PaletteVariantGenerateResult>(),
  }
}

function getSelectedResult<T>(
  state: PaletteAiPersistedHistoryState<T>,
): T | null {
  return state.items.find(entry => entry.id === state.selectedId)?.result ?? state.items[0]?.result ?? null
}

function getSelectedResultId<T>(
  history: PaletteAiResultHistoryEntry<T>[],
  result: T | null,
) {
  return history.find(entry => entry.result === result)?.id ?? null
}

function getSessionHistoryIds(session: PaletteAiPersistedSession) {
  return sessionTabs.flatMap(tab => session[tab].items.map(entry => entry.id))
}

function toPersistedHistoryState<T>(
  history: PaletteAiResultHistoryEntry<T>[],
  result: T | null,
): PaletteAiPersistedHistoryState<T> {
  return {
    items: history,
    selectedId: getSelectedResultId(history, result),
  }
}

export function restorePaletteAiSession(session?: PaletteAiPersistedSession): RestoredPaletteAiSession {
  const resolvedSession = session ?? createEmptyPersistedAiSession()

  return {
    starterHistory: resolvedSession.starter.items,
    auditHistory: resolvedSession.audit.items,
    directionsHistory: resolvedSession.directions.items,
    rampsHistory: resolvedSession.ramps.items,
    variantsHistory: resolvedSession.variants.items,
    starterResult: getSelectedResult(resolvedSession.starter),
    auditResult: getSelectedResult(resolvedSession.audit),
    directionsResult: getSelectedResult(resolvedSession.directions),
    rampsResult: getSelectedResult(resolvedSession.ramps),
    variantsResult: getSelectedResult(resolvedSession.variants),
    historyId: Math.max(0, ...getSessionHistoryIds(resolvedSession)),
  }
}

export function buildPaletteAiPersistedSession(payload: {
  starterHistory: PaletteAiResultHistoryEntry<PaletteDefinition>[]
  starterResult: PaletteDefinition | null
  auditHistory: PaletteAiResultHistoryEntry<PaletteAuditGenerateResult>[]
  auditResult: PaletteAuditGenerateResult | null
  directionsHistory: PaletteAiResultHistoryEntry<PaletteDirectionsGenerateResult>[]
  directionsResult: PaletteDirectionsGenerateResult | null
  rampsHistory: PaletteAiResultHistoryEntry<PaletteRampGenerateResult>[]
  rampsResult: PaletteRampGenerateResult | null
  variantsHistory: PaletteAiResultHistoryEntry<PaletteVariantGenerateResult>[]
  variantsResult: PaletteVariantGenerateResult | null
}): PaletteAiPersistedSession {
  return {
    starter: toPersistedHistoryState(payload.starterHistory, payload.starterResult),
    audit: toPersistedHistoryState(payload.auditHistory, payload.auditResult),
    directions: toPersistedHistoryState(payload.directionsHistory, payload.directionsResult),
    ramps: toPersistedHistoryState(payload.rampsHistory, payload.rampsResult),
    variants: toPersistedHistoryState(payload.variantsHistory, payload.variantsResult),
  }
}
