<script setup lang="ts">
import type { PaletteDefinition } from '~/types/palette'
import { buildPaletteRuntimeTheme } from '~/utils/palette-runtime-styles'

const props = withDefaults(defineProps<{
  isGenerated?: boolean
  isLoading?: boolean
  palette: PaletteDefinition
}>(), {
  isGenerated: false,
  isLoading: false,
})

usePaletteRuntimeUi({
  palette: toRef(props, 'palette'),
})

const shellTheme = computed(() => {
  const lightMode = props.palette.modes.light

  return {
    ...buildPaletteRuntimeTheme(props.palette, 'light'),
    '--landing-gradient-primary': lightMode.color?.primary ?? '#4cd964',
    '--landing-gradient-secondary': lightMode.color?.secondary ?? '#7ab8ff',
    '--landing-backdrop': lightMode.bg?.default ?? '#090d12',
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
