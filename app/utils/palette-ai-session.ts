import type {
  PaletteAiPersistedHistoryState,
  PaletteAiPersistedSession,
  PaletteAiResultHistoryEntry,
  PaletteDirectionsGenerateResult,
  PaletteRampGenerateResult,
} from '~/types/palette-generation'
import type { PaletteDefinition } from '~/types/palette'

export interface RestoredPaletteAiSession {
  starterHistory: PaletteAiResultHistoryEntry<PaletteDefinition>[]
  directionsHistory: PaletteAiResultHistoryEntry<PaletteDirectionsGenerateResult>[]
  rampsHistory: PaletteAiResultHistoryEntry<PaletteRampGenerateResult>[]
  starterResult: PaletteDefinition | null
  directionsResult: PaletteDirectionsGenerateResult | null
  rampsResult: PaletteRampGenerateResult | null
  historyId: number
}

const sessionTabs = ['starter', 'directions', 'ramps'] as const

export function createEmptyPersistedHistoryState<T>(): PaletteAiPersistedHistoryState<T> {
  return {
    items: [],
    selectedId: null,
  }
}

export function createEmptyPersistedAiSession(): PaletteAiPersistedSession {
  return {
    starter: createEmptyPersistedHistoryState<PaletteDefinition>(),
    directions: createEmptyPersistedHistoryState<PaletteDirectionsGenerateResult>(),
    ramps: createEmptyPersistedHistoryState<PaletteRampGenerateResult>(),
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
    directionsHistory: resolvedSession.directions.items,
    rampsHistory: resolvedSession.ramps.items,
    starterResult: getSelectedResult(resolvedSession.starter),
    directionsResult: getSelectedResult(resolvedSession.directions),
    rampsResult: getSelectedResult(resolvedSession.ramps),
    historyId: Math.max(0, ...getSessionHistoryIds(resolvedSession)),
  }
}

export function buildPaletteAiPersistedSession(payload: {
  starterHistory: PaletteAiResultHistoryEntry<PaletteDefinition>[]
  starterResult: PaletteDefinition | null
  directionsHistory: PaletteAiResultHistoryEntry<PaletteDirectionsGenerateResult>[]
  directionsResult: PaletteDirectionsGenerateResult | null
  rampsHistory: PaletteAiResultHistoryEntry<PaletteRampGenerateResult>[]
  rampsResult: PaletteRampGenerateResult | null
}): PaletteAiPersistedSession {
  return {
    starter: toPersistedHistoryState(payload.starterHistory, payload.starterResult),
    directions: toPersistedHistoryState(payload.directionsHistory, payload.directionsResult),
    ramps: toPersistedHistoryState(payload.rampsHistory, payload.rampsResult),
  }
}
