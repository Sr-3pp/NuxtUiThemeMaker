<script setup lang="ts">
import type { PreviewAreaKey } from '~/utils/preview-browser'
import type { PreviewPanelContentProps } from '~/types/theme-preview'
import { previewAreaDefinitions } from '~/utils/preview-browser'

const props = defineProps<PreviewPanelContentProps>()

const searchQuery = ref('')
const selectedArea = ref<PreviewAreaKey>('actions')

const filteredAreas = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  if (!query) {
    return previewAreaDefinitions
  }

  return previewAreaDefinitions.filter((area) => {
    return area.label.toLowerCase().includes(query)
      || area.components.some(component => component.toLowerCase().includes(query))
      || area.tokens.some(token => token.toLowerCase().includes(query))
  })
})

const areaOptions = computed(() => filteredAreas.value.map(area => ({
  label: area.label,
  value: area.value,
})))

const activeArea = computed(() => {
  return filteredAreas.value.find(area => area.value === selectedArea.value) ?? filteredAreas.value[0]
})

watchEffect(() => {
  if (!areaOptions.value.length) {
    return
  }

  if (!areaOptions.value.some(option => option.value === selectedArea.value)) {
    selectedArea.value = areaOptions.value[0]!.value
  }
})
</script>

<template>
  <div class="space-y-6">
    <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_240px]">
      <UInput
        v-model="searchQuery"
        icon="i-lucide-search"
        placeholder="Search components, areas or token groups"
      />

      <USelect
        v-model="selectedArea"
        :items="areaOptions"
        value-key="value"
        color="neutral"
        variant="outline"
      />
    </div>

    <div
      v-if="activeArea"
      class="space-y-6"
    >
      <PreviewInspectLegend v-if="props.inspectTokens" :area="activeArea.value" />

      <PreviewActions
        v-if="activeArea.value === 'actions'"
        :disable-interactive="props.disableInteractive"
        :palette="props.palette"
      />
      <PreviewNavigation
        v-else-if="activeArea.value === 'navigation'"
        :disable-interactive="props.disableInteractive"
        :palette="props.palette"
      />
      <PreviewForms
        v-else-if="activeArea.value === 'forms'"
        :disable-interactive="props.disableInteractive"
        :palette="props.palette"
      />
      <PreviewOverlays
        v-else-if="activeArea.value === 'overlays'"
        :disable-interactive="props.disableInteractive"
        :palette="props.palette"
      />
      <PreviewSurfaces
        v-else-if="activeArea.value === 'surfaces'"
        :disable-interactive="props.disableInteractive"
        :palette="props.palette"
      />
      <PreviewDataDisplay
        v-else-if="activeArea.value === 'dataDisplay'"
        :disable-interactive="props.disableInteractive"
        :palette="props.palette"
      />
      <PreviewFeedback
        v-else-if="activeArea.value === 'feedback'"
        :disable-interactive="props.disableInteractive"
        :palette="props.palette"
      />
      <PreviewTypography
        v-else
        :disable-interactive="props.disableInteractive"
        :palette="props.palette"
      />
    </div>

    <div
      v-else
      class="rounded-xl border border-dashed border-default/60 bg-muted/10 px-4 py-6 text-sm text-muted"
    >
      No preview areas match the current filter.
    </div>
  </div>
</template>
