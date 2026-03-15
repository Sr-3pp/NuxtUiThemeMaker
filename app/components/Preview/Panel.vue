<script setup lang="ts">
import type { PaletteDefinition } from '~/types/palette'

const props = withDefaults(defineProps<{
  disableInteractive?: boolean
  palette: PaletteDefinition | null
}>(), {
  disableInteractive: false,
})

const colorMode = useColorMode()
const previewTab = ref<'components' | 'forms' | 'surfaces' | 'typography'>('components')
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
  <div :style="previewTheme">
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
      <template #components>
        <PreviewActions :disable-interactive="props.disableInteractive" />
        <PreviewNavigation :disable-interactive="props.disableInteractive" class="mt-6" />
      </template>

      <template #forms>
        <PreviewForms :disable-interactive="props.disableInteractive" />
        <PreviewOverlays :disable-interactive="props.disableInteractive" />
      </template>

      <template #surfaces>
        <PreviewDataDisplay class="mb-10" :disable-interactive="props.disableInteractive" />
        <PreviewFeedback :disable-interactive="props.disableInteractive" />
      </template>

      <template #typography>
        <PreviewSurfaces />
      </template>
    </UTabs>
  </div>
</template>
