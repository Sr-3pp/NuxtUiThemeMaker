<script setup lang="ts">
import type { PaletteDefinition } from '~/types/palette'
import { buildPaletteRuntimeTheme } from '~/utils/palette-theme'

const props = withDefaults(defineProps<{
  isGenerated?: boolean
  isLoading?: boolean
  palette: PaletteDefinition
}>(), {
  isGenerated: false,
  isLoading: false,
})

const colorMode = useColorMode()

usePaletteRuntimeUi({
  palette: toRef(props, 'palette'),
})

const shellTheme = computed(() => {
  const mode = colorMode.value === 'dark' ? 'dark' : 'light'
  const modeColors = props.palette.modes[mode]

  return {
    ...buildPaletteRuntimeTheme(props.palette, mode),
    '--landing-gradient-primary': modeColors.color?.primary ?? '#4cd964',
    '--landing-gradient-secondary': modeColors.color?.secondary ?? '#7ab8ff',
    '--landing-backdrop': modeColors.bg?.default ?? '#090d12',
  }
})
</script>

<template>
  <div
    class="landing-theme-shell min-h-screen text-default transition-colors duration-300"
    :class="{
      'landing-theme-shell--generated': props.isGenerated,
      'landing-theme-shell--loading': props.isLoading,
    }"
    :style="shellTheme"
  >
    <slot />
  </div>
</template>
