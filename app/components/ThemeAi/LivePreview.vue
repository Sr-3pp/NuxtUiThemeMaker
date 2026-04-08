<script setup lang="ts">
import type { PaletteDefinition } from '~/types/palette'
import type { PreviewTabValue } from '~/types/theme-preview'

const props = defineProps<{
  palette: PaletteDefinition
  title?: string
}>()

const previewTab = ref<Extract<PreviewTabValue, 'browser' | 'components'>>('browser')

const previewFrames = computed(() => {
  return (['light', 'dark'] as const).map(mode => ({
    mode,
    label: mode === 'light' ? 'Light preview' : 'Dark preview',
    theme: themeBuilder(props.palette.modes[mode]),
  }))
})
</script>

<template>
  <UCard variant="outline" class="rounded-2xl shadow-none">
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
      <UTabs
        v-model="previewTab"
        :items="[
          { label: 'Browser', value: 'browser', slot: 'browser' },
          { label: 'Components', value: 'components', slot: 'components' },
        ]"
        color="neutral"
        variant="link"
        :ui="{ list: 'w-full border-b border-default/60' }"
      >
        <template #browser>
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

              <div :style="frame.theme" class="max-h-[520px] overflow-auto rounded-2xl border border-default/60 bg-default p-3">
                <PreviewBrowserTab :disable-interactive="true" :palette="props.palette" :inspect-tokens="false" />
              </div>
            </div>
          </div>
        </template>

        <template #components>
          <div class="grid gap-4 xl:grid-cols-2">
            <div
              v-for="frame in previewFrames"
              :key="`components-${frame.mode}`"
              class="space-y-2"
            >
              <div class="flex items-center justify-between rounded-xl border border-default/60 bg-muted/20 px-3 py-2 text-xs text-muted">
                <span>{{ frame.label }}</span>
                <UBadge color="neutral" variant="soft">
                  {{ frame.mode }}
                </UBadge>
              </div>

              <div :style="frame.theme" class="max-h-[520px] overflow-auto rounded-2xl border border-default/60 bg-default p-3">
                <PreviewComponentsTab :disable-interactive="true" :palette="props.palette" :inspect-tokens="false" />
              </div>
            </div>
          </div>
        </template>
      </UTabs>
    </div>
  </UCard>
</template>
