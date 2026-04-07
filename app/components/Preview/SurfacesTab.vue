<script setup lang="ts">
import type { PreviewInteractiveProps } from '~/types/theme-preview'

const props = defineProps<PreviewInteractiveProps>()
</script>

<template>
  <div class="space-y-10">
    <PreviewSurfaces :disable-interactive="props.disableInteractive" :palette="props.palette" />
    <PreviewDataDisplay :disable-interactive="props.disableInteractive" :palette="props.palette" />
    <PreviewFeedback :disable-interactive="props.disableInteractive" :palette="props.palette" />
  </div>
</template>
