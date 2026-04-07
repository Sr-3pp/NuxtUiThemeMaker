<script setup lang="ts">
import type { PreviewInteractiveProps } from '~/types/theme-preview'

const props = defineProps<PreviewInteractiveProps>()
</script>

<template>
  <div class="space-y-6">
    <PreviewActions :disable-interactive="props.disableInteractive" :palette="props.palette" />
    <PreviewNavigation :disable-interactive="props.disableInteractive" :palette="props.palette" />
  </div>
</template>
