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
    historyId: Math.max(
      0,
      ...resolvedSession.starter.items.map(entry => entry.id),
      ...resolvedSession.audit.items.map(entry => entry.id),
      ...resolvedSession.directions.items.map(entry => entry.id),
      ...resolvedSession.ramps.items.map(entry => entry.id),
      ...resolvedSession.variants.items.map(entry => entry.id),
    ),
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
    starter: {
      items: payload.starterHistory,
      selectedId: payload.starterHistory.find(entry => entry.result === payload.starterResult)?.id ?? null,
    },
    audit: {
      items: payload.auditHistory,
      selectedId: payload.auditHistory.find(entry => entry.result === payload.auditResult)?.id ?? null,
    },
    directions: {
      items: payload.directionsHistory,
      selectedId: payload.directionsHistory.find(entry => entry.result === payload.directionsResult)?.id ?? null,
    },
    ramps: {
      items: payload.rampsHistory,
      selectedId: payload.rampsHistory.find(entry => entry.result === payload.rampsResult)?.id ?? null,
    },
    variants: {
      items: payload.variantsHistory,
      selectedId: payload.variantsHistory.find(entry => entry.result === payload.variantsResult)?.id ?? null,
    },
  }
}
