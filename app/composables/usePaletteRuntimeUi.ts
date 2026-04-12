import { toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import type { PaletteDefinition } from '~/types/palette'
import {
  applyPaletteRuntimeUi,
  restorePaletteRuntimeUi,
  snapshotPaletteRuntimeUi,
} from '~/utils/palette-runtime-app-config'
import { resolvePaletteRuntimeUi } from '~/utils/palette-runtime-ui'
import { emptyPalette } from '~/utils/paletteRegistry'

type UiSnapshot = Record<string, unknown>

export function usePaletteRuntimeUi(options?: {
  palette?: MaybeRefOrGetter<PaletteDefinition | null | undefined>
}) {
  const appConfig = useAppConfig()
  const snapshot = shallowRef<UiSnapshot | null>(null)
  const appliedKeys = ref<string[]>([])
  const applied = ref(false)

  const activePalette = computed(() => {
    const palette = options?.palette ? toValue(options.palette) : null
    return palette ?? emptyPalette
  })

  const generatedUi = computed(() => resolvePaletteRuntimeUi(activePalette.value))

  function getUiConfig() {
    return (appConfig.ui as unknown as Record<string, unknown>)
  }

  function ensureSnapshot(uiConfig: Record<string, unknown>) {
    if (snapshot.value) {
      return
    }

    snapshot.value = snapshotPaletteRuntimeUi(uiConfig)
  }

  function applyGeneratedUi() {
    const uiConfig = getUiConfig()
    ensureSnapshot(uiConfig)
    appliedKeys.value = applyPaletteRuntimeUi(
      uiConfig,
      generatedUi.value,
      snapshot.value ?? {},
      appliedKeys.value,
    )

    applied.value = true
  }

  function resetGeneratedUi() {
    if (!applied.value || !snapshot.value) {
      return
    }

    const uiConfig = getUiConfig()
    restorePaletteRuntimeUi(uiConfig, snapshot.value)

    appliedKeys.value = []
    snapshot.value = null
    applied.value = false
  }

  watch(generatedUi, () => {
    applyGeneratedUi()
  }, { immediate: true, deep: true })

  onBeforeUnmount(resetGeneratedUi)

  return {
    applyGeneratedUi,
    resetGeneratedUi,
  }
}
