<script setup lang="ts">
import type { PaletteDefinition } from '~/types/palette'
import type { PreviewFrameMode, PreviewTabValue, PreviewViewport } from '~/types/theme-preview'

const props = withDefaults(defineProps<{
  disableInteractive?: boolean
  palette: PaletteDefinition | null
}>(), {
  disableInteractive: false,
})

const colorMode = useColorMode()
const previewTab = ref<PreviewTabValue>('browser')
const previewMode = ref<PreviewFrameMode>('current')
const previewViewport = ref<PreviewViewport>('desktop')
const inspectTokens = ref(false)
const isQaModalOpen = ref(false)
const previewTabs = [
  { label: 'Browser', value: 'browser', slot: 'browser' },
  { label: 'Components', value: 'components', slot: 'components' },
  { label: 'Forms', value: 'forms', slot: 'forms' },
  { label: 'Surfaces', value: 'surfaces', slot: 'surfaces' },
  { label: 'Typography', value: 'typography', slot: 'typography' }
]
const previewModeItems = [
  { label: 'Current mode', value: 'current' },
  { label: 'Light only', value: 'light' },
  { label: 'Dark only', value: 'dark' },
  { label: 'Split compare', value: 'split' },
]
const previewViewportItems = [
  { label: 'Mobile', value: 'mobile' },
  { label: 'Tablet', value: 'tablet' },
  { label: 'Desktop', value: 'desktop' },
  { label: 'Full width', value: 'full' },
]

const currentMode = computed(() => {
  return colorMode.value === 'dark' ? 'dark' : 'light'
})

const previewFrames = computed(() => {
  if (!props.palette) {
    return []
  }

  const modes = previewMode.value === 'split'
    ? ['light', 'dark'] as const
    : [previewMode.value === 'current' ? currentMode.value : previewMode.value]

  return modes.map(mode => ({
    mode,
    label: mode === 'light' ? 'Light preview' : 'Dark preview',
    theme: themeBuilder(props.palette!.modes[mode]),
  }))
})

const previewViewportClass = computed(() => {
  switch (previewViewport.value) {
    case 'mobile':
      return 'mx-auto w-full max-w-sm'
    case 'tablet':
      return 'mx-auto w-full max-w-3xl'
    case 'full':
      return 'w-full'
    default:
      return 'mx-auto w-full max-w-6xl'
  }
})
</script>

<template>
  <div class="space-y-4">
    <ThemeQaModal v-model:open="isQaModalOpen" :palette="props.palette" />

    <UCard variant="outline" class="rounded-2xl shadow-none dark:border-white/10 dark:bg-black/40">
      <template #header>
        <div class="space-y-1">
          <p class="text-sm font-medium dark:text-white">
            Preview controls
          </p>
          <p class="text-xs text-muted">
            Compare light and dark themes, switch viewport widths, and inspect which token groups each section exercises.
          </p>
        </div>
      </template>

      <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto_auto]">
        <div class="rounded-xl border border-default/60 bg-muted/20 px-3 py-2 text-xs text-muted">
          Browser mode helps scan coverage quickly. Split compare renders light and dark previews side by side.
        </div>

        <USelect
          v-model="previewMode"
          :items="previewModeItems"
          value-key="value"
          color="neutral"
          variant="outline"
        />

        <USelect
          v-model="previewViewport"
          :items="previewViewportItems"
          value-key="value"
          color="neutral"
          variant="outline"
        />

        <div class="flex items-center justify-between gap-3 rounded-xl border border-default/60 bg-muted/20 px-3 py-2">
          <span class="text-sm text-muted">Inspect tokens</span>
          <USwitch v-model="inspectTokens" />
        </div>

        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-shield-check"
          @click="isQaModalOpen = true"
        >
          QA report
        </UButton>
      </div>
    </UCard>

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

        <div :style="frame.theme" :class="previewViewportClass">
          <UTabs
            v-model="previewTab"
            :items="previewTabs"
            color="neutral"
            variant="pill"
            :ui="{
              root: 'mb-4',
              list: 'inline-flex rounded-2xl border border-white/10 bg-white/5 p-1',
              trigger: 'rounded-xl px-4 py-2 text-sm text-white/60 data-[state=active]:bg-black data-[state=active]:text-white hover:text-white',
              indicator: 'hidden'
            }"
          >
            <template #browser>
              <PreviewBrowserTab
                :disable-interactive="props.disableInteractive"
                :palette="props.palette"
                :inspect-tokens="inspectTokens"
              />
            </template>

            <template #components>
              <PreviewComponentsTab
                :disable-interactive="props.disableInteractive"
                :palette="props.palette"
                :inspect-tokens="inspectTokens"
              />
            </template>

            <template #forms>
              <PreviewFormsTab
                :disable-interactive="props.disableInteractive"
                :palette="props.palette"
                :inspect-tokens="inspectTokens"
              />
            </template>

            <template #surfaces>
              <PreviewSurfacesTab
                :disable-interactive="props.disableInteractive"
                :palette="props.palette"
                :inspect-tokens="inspectTokens"
              />
            </template>

            <template #typography>
              <PreviewTypographyTab
                :disable-interactive="props.disableInteractive"
                :palette="props.palette"
                :inspect-tokens="inspectTokens"
              />
            </template>
          </UTabs>
        </div>
      </div>
    </div>
  </div>
</template>
