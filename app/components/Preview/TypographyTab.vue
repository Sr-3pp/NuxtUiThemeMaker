<script setup lang="ts">
import type { PreviewPanelContentProps } from '~/types/theme-preview'

const props = defineProps<PreviewPanelContentProps>()
</script>

<template>
  <div class="space-y-6">
    <PreviewInspectLegend v-if="props.inspectTokens" area="typography" />
    <PreviewTypography :disable-interactive="props.disableInteractive" :palette="props.palette" />
  </div>
</template>
