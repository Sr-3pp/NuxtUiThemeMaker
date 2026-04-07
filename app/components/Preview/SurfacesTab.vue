<script setup lang="ts">
import type { PreviewPanelContentProps } from '~/types/theme-preview'

const props = defineProps<PreviewPanelContentProps>()
</script>

<template>
  <div class="space-y-10">
    <PreviewInspectLegend v-if="props.inspectTokens" area="surfaces" />
    <PreviewSurfaces :disable-interactive="props.disableInteractive" :palette="props.palette" />
    <PreviewInspectLegend v-if="props.inspectTokens" area="dataDisplay" />
    <PreviewDataDisplay :disable-interactive="props.disableInteractive" :palette="props.palette" />
    <PreviewInspectLegend v-if="props.inspectTokens" area="feedback" />
    <PreviewFeedback :disable-interactive="props.disableInteractive" :palette="props.palette" />
    <PreviewInspectLegend v-if="props.inspectTokens" area="systemStates" />
    <PreviewSystemStates :disable-interactive="props.disableInteractive" :palette="props.palette" />
  </div>
</template>
