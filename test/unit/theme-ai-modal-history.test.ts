import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import {
  getSelectedThemeAiHistoryId,
  pushThemeAiResultHistory,
  selectThemeAiHistoryResult,
  summarizeThemeAiPrompt,
} from '../../app/utils/theme-ai-modal-history'

describe('theme AI modal history utils', () => {
  it('summarizes prompts with a fallback and truncation', () => {
    expect(summarizeThemeAiPrompt('   ', 'Fallback')).toBe('Fallback')
    expect(summarizeThemeAiPrompt('Short prompt', 'Fallback')).toBe('Short prompt')
    expect(summarizeThemeAiPrompt('This prompt is intentionally long enough to require truncation in the chip label.', 'Fallback'))
      .toBe('This prompt is intentionally long enough to requ...')
  })

  it('tracks selection and replaces duplicate history labels with the newest entry', () => {
    const history = ref<{ id: number, label: string, createdAt: string, detail?: string, result: { name: string } }[]>([])
    const historyId = ref(0)
    const firstResult = { name: 'First' }
    const secondResult = { name: 'Second' }

    pushThemeAiResultHistory(history, historyId, firstResult, 'Starter', 'Ocean dashboard')
    pushThemeAiResultHistory(history, historyId, secondResult, 'Starter', 'Ocean dashboard')

    expect(history.value).toHaveLength(1)
    expect(history.value[0]?.result).toStrictEqual(secondResult)
    expect(selectThemeAiHistoryResult(history.value, history.value[0]!.id)).toStrictEqual(secondResult)
    expect(getSelectedThemeAiHistoryId(history.value, history.value[0]?.result ?? null)).toBe(history.value[0]?.id ?? null)
  })

  it('caps history length at four entries', () => {
    const history = ref<{ id: number, label: string, createdAt: string, detail?: string, result: number }[]>([])
    const historyId = ref(0)

    for (let index = 0; index < 5; index += 1) {
      pushThemeAiResultHistory(history, historyId, index, `Run ${index}`, `Detail ${index}`)
    }

    expect(history.value).toHaveLength(4)
    expect(history.value.map(entry => entry.result)).toEqual([4, 3, 2, 1])
  })
})
