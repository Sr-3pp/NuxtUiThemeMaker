import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { runThemeAiModalAction } from '../../app/utils/theme-ai-modal-actions'

describe('theme AI modal action utils', () => {
  it('does nothing when the action cannot run', async () => {
    const loading = ref(false)
    const execute = vi.fn()
    const handleError = vi.fn()

    await runThemeAiModalAction({
      loading,
      canRun: false,
      execute,
      handleError,
    })

    expect(execute).not.toHaveBeenCalled()
    expect(handleError).not.toHaveBeenCalled()
    expect(loading.value).toBe(false)
  })

  it('runs the action and clears loading on success', async () => {
    const loading = ref(false)
    const execute = vi.fn().mockResolvedValue(undefined)
    const handleError = vi.fn()

    await runThemeAiModalAction({
      loading,
      canRun: true,
      execute,
      handleError,
    })

    expect(execute).toHaveBeenCalledTimes(1)
    expect(handleError).not.toHaveBeenCalled()
    expect(loading.value).toBe(false)
  })

  it('routes failures through the error handler and clears loading', async () => {
    const loading = ref(false)
    const error = new Error('boom')
    const execute = vi.fn().mockRejectedValue(error)
    const handleError = vi.fn().mockResolvedValue(undefined)

    await runThemeAiModalAction({
      loading,
      canRun: true,
      execute,
      handleError,
    })

    expect(handleError).toHaveBeenCalledWith(error)
    expect(loading.value).toBe(false)
  })
})
