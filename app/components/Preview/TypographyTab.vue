<script setup lang="ts">
import type { PreviewPanelContentProps } from '~/types/theme-preview'

defineProps<PreviewPanelContentProps>()

const sections = [
  { area: 'typography', component: 'PreviewTypography' },
] as const
</script>

<template>
  <PreviewSectionStack
    :sections="sections"
    :disable-interactive="disableInteractive"
    :palette="palette"
    :inspect-tokens="inspectTokens"
  />
</template>
