<script setup lang="ts">
import type { PaletteDefinition } from '~/types/palette'

const props = withDefaults(defineProps<{
  disableInteractive?: boolean
  palette: PaletteDefinition | null
}>(), {
  disableInteractive: false,
})
</script>

<template>
  <UDashboardPanel
    :ui="{
      root: 'h-screen overflow-auto'
    }"
  >
    <ThemePreviewContent
      :palette="props.palette"
      :disable-interactive="props.disableInteractive"
      container-class="px-4 pb-8 pt-28"
    />
  </UDashboardPanel>
</template>
