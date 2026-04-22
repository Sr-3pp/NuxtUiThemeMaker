<script setup lang="ts">
import type { PaletteDefinition } from '~/types/palette'

const props = defineProps<{
  palette: PaletteDefinition
  title?: string
}>()

usePaletteRuntimeUi({
  palette: toRef(props, 'palette'),
})

const previewFrames = computed(() => {
  return (['light', 'dark'] as const).map(mode => ({
    mode,
    label: mode === 'light' ? 'Light preview' : 'Dark preview',
    theme: themeBuilder(props.palette.modes[mode]),
  }))
})
</script>

<template>
  <UCard variant="outline">
    <template #header>
      <div class="space-y-1">
        <p class="text-sm font-medium text-highlighted">
          {{ props.title ?? 'Live preview' }}
        </p>
        <p class="text-xs text-muted">
          Rendered preview of the generated palette in light and dark modes.
        </p>
      </div>
    </template>

    <div class="space-y-4">
      <div class="grid gap-4 xl:grid-cols-2">
        <div
          v-for="frame in previewFrames"
          :key="`browser-${frame.mode}`"
          class="space-y-2"
        >
          <div class="flex items-center justify-between rounded-xl border border-default/60 bg-muted/20 px-3 py-2 text-xs text-muted">
            <span>{{ frame.label }}</span>
            <UBadge color="neutral" variant="soft">
              {{ frame.mode }}
            </UBadge>
          </div>

          <div :style="frame.theme" class="max-h-[520px] overflow-auto rounded -lg border border-default/60 bg-default p-3">
            <PreviewBrowserTab :disable-interactive="true" :palette="props.palette" />
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>
