import type { Ref } from 'vue'

export async function runThemeAiModalAction(options: {
  loading: Ref<boolean>
  canRun: boolean
  execute: () => Promise<void>
  handleError: (error: unknown) => Promise<void> | void
}) {
  if (!options.canRun || options.loading.value) {
    return
  }

  options.loading.value = true

  try {
    await options.execute()
  } catch (error) {
    await options.handleError(error)
  } finally {
    options.loading.value = false
  }
}
