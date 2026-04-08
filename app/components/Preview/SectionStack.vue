<script setup lang="ts">
import type { PreviewPanelContentProps } from '~/types/theme-preview'
import type { PreviewAreaKey } from '~/utils/preview-browser'

defineProps<PreviewPanelContentProps & {
  sections: ReadonlyArray<{
    area: PreviewAreaKey
    component: string
  }>
  spacingClass?: string
}>()
</script>

<template>
  <div :class="spacingClass ?? 'space-y-6'">
    <template
      v-for="section in sections"
      :key="section.area"
    >
      <PreviewInspectLegend
        v-if="inspectTokens"
        :area="section.area"
      />
      <component
        :is="section.component"
        :disable-interactive="disableInteractive"
        :palette="palette"
      />
    </template>
  </div>
</template>
