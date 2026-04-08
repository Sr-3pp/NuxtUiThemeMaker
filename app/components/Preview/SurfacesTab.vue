<script setup lang="ts">
import type { PreviewPanelContentProps } from '~/types/theme-preview'

defineProps<PreviewPanelContentProps>()

const sections = [
  { area: 'surfaces', component: 'PreviewSurfaces' },
  { area: 'dataDisplay', component: 'PreviewDataDisplay' },
  { area: 'feedback', component: 'PreviewFeedback' },
  { area: 'systemStates', component: 'PreviewSystemStates' },
  { area: 'commandCenter', component: 'PreviewCommandCenter' },
  { area: 'notifications', component: 'PreviewNotifications' },
] as const
</script>

<template>
  <PreviewSectionStack
    :sections="sections"
    spacing-class="space-y-10"
    :disable-interactive="disableInteractive"
    :palette="palette"
    :inspect-tokens="inspectTokens"
  />
</template>
