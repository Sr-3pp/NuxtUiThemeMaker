<script setup lang="ts">
import type { PaletteDefinition } from '~/types/palette'
import { buildPaletteRuntimeTheme } from '~/utils/palette-theme'

const props = withDefaults(defineProps<{
  disableInteractive?: boolean
  palette: PaletteDefinition | null
}>(), {
  disableInteractive: false,
})

const colorMode = useColorMode()

const currentMode = computed(() => {
  return colorMode.value === 'dark' ? 'dark' : 'light'
})

const previewFrame = computed(() => {
  if (!props.palette) {
    return null
  }

  const mode = currentMode.value

  return {
    mode,
    label: mode === 'light' ? 'Light preview' : 'Dark preview',
    theme: buildPaletteRuntimeTheme(props.palette, mode),
  }
})
</script>

<template>
  <div class="space-y-3">
    <div
      v-if="previewFrame"
      class="flex items-center justify-between rounded-xl border border-default/60 bg-muted/20 px-3 py-2 text-xs text-muted"
    >
      <span>{{ previewFrame.label }}</span>
      <UBadge color="neutral" variant="soft">
        {{ previewFrame.mode }}
      </UBadge>
    </div>

    <div v-if="previewFrame" :style="previewFrame.theme" class="mx-auto w-full max-w-6xl">
      <PreviewBrowserTab
        :disable-interactive="props.disableInteractive"
        :palette="props.palette"
      />
    </div>

    <div
      v-else
      class="rounded-xl border border-dashed border-default/60 bg-muted/10 px-4 py-6 text-sm text-muted"
    >
      No palette selected.
    </div>
  </div>
</template>
