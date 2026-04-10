<script setup lang="ts">
import type { PreviewPanelContentProps } from '~/types/theme-preview'

const props = defineProps<PreviewPanelContentProps>()
const { activeArea } = usePreviewAreaState()
</script>

<template>
  <div class="space-y-6">
    <div
      v-if="activeArea"
      class="space-y-6"
    >
      <PreviewActions
        v-if="activeArea.value === 'actions'"
        :disable-interactive="props.disableInteractive"
        :palette="props.palette"
      />
      <PreviewStateMatrix
        v-else-if="activeArea.value === 'stateMatrix'"
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
      <PreviewSystemStates
        v-else-if="activeArea.value === 'systemStates'"
        :disable-interactive="props.disableInteractive"
        :palette="props.palette"
      />
      <PreviewCommandCenter
        v-else-if="activeArea.value === 'commandCenter'"
        :disable-interactive="props.disableInteractive"
        :palette="props.palette"
      />
      <PreviewNotifications
        v-else-if="activeArea.value === 'notifications'"
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
