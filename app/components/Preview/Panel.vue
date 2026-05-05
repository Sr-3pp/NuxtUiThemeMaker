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
const { isSplitView } = usePreviewSplitView()

const currentMode = computed(() => {
  return colorMode.value === 'dark' ? 'dark' : 'light'
})

const previewFrames = computed(() => {
  if (!props.palette) {
    return []
  }

  const modes = isSplitView.value
    ? ['light', 'dark'] as const
    : [currentMode.value as 'light' | 'dark']

  return modes.map(mode => ({
    mode,
    label: mode === 'light' ? 'Light preview' : 'Dark preview',
    theme: buildPaletteRuntimeTheme(props.palette!, mode),
  }))
})
</script>

<template>
  <div class="space-y-4">
    <div
      class="grid gap-6"
      :class="previewFrames.length === 2 ? 'xl:grid-cols-2' : ''"
    >
      <div
        v-for="frame in previewFrames"
        :key="frame.mode"
        class="space-y-3"
      >
        <div
          v-if="previewFrames.length > 1"
          class="flex items-center justify-between rounded-xl border border-default/60 bg-muted/20 px-3 py-2 text-xs text-muted"
        >
          <span>{{ frame.label }}</span>
          <UBadge color="neutral" variant="soft">
            {{ frame.mode }}
          </UBadge>
        </div>

        <div :style="frame.theme" class="mx-auto w-full max-w-6xl">
          <PreviewBrowserTab
            :disable-interactive="props.disableInteractive"
            :palette="props.palette"
          />
        </div>
      </div>
    </div>
  </div>
</template>
