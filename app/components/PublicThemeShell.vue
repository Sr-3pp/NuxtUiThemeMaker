<script setup lang="ts">
import { buildPaletteRuntimeTheme } from '~/utils/palette-theme'

const props = withDefaults(defineProps<{
  isGenerated?: boolean
  isLoading?: boolean
}>(), {
  isGenerated: false,
  isLoading: false,
})

const resolvedMode = useResolvedPaletteMode()
const { activePalette, generated, isGenerating } = useLandingPaletteWorkflow()

usePaletteRuntimeUi({
  palette: activePalette,
})

const shellTheme = computed(() => {
  const mode = resolvedMode.value
  const modeColors = activePalette.value.modes[mode]

  return {
    ...buildPaletteRuntimeTheme(activePalette.value, mode),
    '--landing-gradient-primary': modeColors.color?.primary ?? '#4cd964',
    '--landing-gradient-secondary': modeColors.color?.secondary ?? '#7ab8ff',
    '--landing-backdrop': modeColors.bg?.default ?? '#090d12',
  }
})

const shouldShowGeneratedState = computed(() => props.isGenerated || Boolean(generated.value.palette))
const shouldShowLoadingState = computed(() => props.isLoading || isGenerating.value)

const documentThemeSnapshot = import.meta.client
  ? new Map<string, string>()
  : null

if (import.meta.client && documentThemeSnapshot) {
  watch(shellTheme, (nextTheme) => {
    for (const key of Object.keys(nextTheme)) {
      if (!documentThemeSnapshot.has(key)) {
        documentThemeSnapshot.set(key, document.documentElement.style.getPropertyValue(key))
      }

      document.documentElement.style.setProperty(key, nextTheme[key] ?? null)
    }
  }, { immediate: true })

  onBeforeUnmount(() => {
    for (const [key, value] of documentThemeSnapshot.entries()) {
      if (value) {
        document.documentElement.style.setProperty(key, value)
        continue
      }

      document.documentElement.style.removeProperty(key)
    }
  })
}
</script>

<template>
  <div
    class="landing-theme-shell min-h-screen text-default transition-colors duration-300"
    :class="{
      'landing-theme-shell--generated': shouldShowGeneratedState,
      'landing-theme-shell--loading': shouldShowLoadingState,
    }"
    :style="shellTheme"
  >
    <slot />
  </div>
</template>
