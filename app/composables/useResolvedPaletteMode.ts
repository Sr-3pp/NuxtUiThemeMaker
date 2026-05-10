import type { PaletteModeKey } from '~/types/palette'

export function useResolvedPaletteMode(defaultMode: PaletteModeKey = 'light') {
  const colorMode = useColorMode()
  const resolvedMode = ref<PaletteModeKey>(defaultMode)

  function resolveMode(): PaletteModeKey {
    if (import.meta.client) {
      const classList = document.documentElement.classList

      if (classList.contains('dark')) {
        return 'dark'
      }

      if (classList.contains('light')) {
        return 'light'
      }
    }

    if (colorMode.value === 'dark' || colorMode.value === 'light') {
      return colorMode.value
    }

    return defaultMode
  }

  function syncResolvedMode() {
    resolvedMode.value = resolveMode()
  }

  watch(() => colorMode.value, syncResolvedMode, { immediate: true })

  if (import.meta.client) {
    let observer: MutationObserver | null = null

    onMounted(() => {
      syncResolvedMode()

      observer = new MutationObserver(syncResolvedMode)
      observer.observe(document.documentElement, {
        attributeFilter: ['class'],
        attributes: true,
      })
    })

    onBeforeUnmount(() => {
      observer?.disconnect()
      observer = null
    })
  }

  return resolvedMode
}
