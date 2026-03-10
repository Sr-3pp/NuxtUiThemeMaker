<script setup lang="ts">
import type { PaletteDefinition } from '~/types/palette'
import type { PreviewTab } from '~/types/theme-builder'
import themeBuilder from '~/utils/theme-builder'

const props = withDefaults(defineProps<{
  disableInteractive?: boolean
  palette: PaletteDefinition | null
}>(), {
  disableInteractive: false,
})

const colorMode = useColorMode()
const previewTab = ref<PreviewTab>('components')
const previewTabs = [
  { label: 'Components', value: 'components', slot: 'components' },
  { label: 'Forms', value: 'forms', slot: 'forms' },
  { label: 'Surfaces', value: 'surfaces', slot: 'surfaces' },
  { label: 'Typography', value: 'typography', slot: 'typography' }
]

const currentMode = computed(() => {
  return colorMode.value === 'dark' ? 'dark' : 'light'
})

const previewTheme = computed(() => {
  if (!props.palette) {
    return undefined
  }

  return themeBuilder(props.palette.modes[currentMode.value])
})
</script>

<template>
  <div :style="previewTheme" class="h-full px-4">
    <UTabs
      v-model="previewTab"
      :items="previewTabs"
      color="neutral"
      variant="pill"
      :ui="{
        list: 'inline-flex rounded-2xl border border-white/10 bg-white/5 p-1',
        trigger: 'rounded-xl px-4 py-2 text-sm text-white/60 data-[state=active]:bg-black data-[state=active]:text-white hover:text-white',
        indicator: 'hidden'
      }"
    >
      <template #components>
        <ThemePreviewActions :disable-interactive="props.disableInteractive" />
        <ThemePreviewNavigation :disable-interactive="props.disableInteractive" class="mt-6" />
      </template>

      <template #forms>
        <ThemePreviewForms :disable-interactive="props.disableInteractive" />
        <ThemePreviewOverlays :disable-interactive="props.disableInteractive" />
      </template>

      <template #surfaces>
        <ThemePreviewFeedback :disable-interactive="props.disableInteractive" />
      </template>

      <template #typography>
        <ThemePreviewSurfaces />
      </template>
    </UTabs>
  </div>
</template>
