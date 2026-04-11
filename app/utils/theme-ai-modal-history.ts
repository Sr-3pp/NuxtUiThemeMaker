import type { Ref } from 'vue'
import type { PaletteAiResultHistoryEntry } from '~/types/palette-generation'

const MAX_RESULT_HISTORY = 4

export function summarizeThemeAiPrompt(value: string | undefined, fallback: string) {
  const normalized = value?.trim()

  if (!normalized) {
    return fallback
  }

  return normalized.length > 48
    ? `${normalized.slice(0, 48).trimEnd()}...`
    : normalized
}

export function selectThemeAiHistoryResult<T>(
  history: PaletteAiResultHistoryEntry<T>[],
  id: number,
) {
  return history.find(entry => entry.id === id)?.result ?? null
}

export function getSelectedThemeAiHistoryId<T>(
  history: PaletteAiResultHistoryEntry<T>[],
  result: T | null,
) {
  return history.find(entry => entry.result === result)?.id ?? null
}

export function pushThemeAiResultHistory<T>(
  history: Ref<PaletteAiResultHistoryEntry<T>[]>,
  historyId: Ref<number>,
  result: T,
  label: string,
  detail?: string,
) {
  historyId.value += 1
  const nextDetail = detail?.trim() || undefined

  history.value = [
    {
      id: historyId.value,
      label,
      createdAt: new Date().toISOString(),
      detail: nextDetail,
      result,
    },
    ...history.value.filter(entry => entry.label !== label || (entry.detail?.trim() || undefined) !== nextDetail),
  ].slice(0, MAX_RESULT_HISTORY)
}
