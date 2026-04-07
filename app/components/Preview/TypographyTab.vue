<script setup lang="ts">
import type { PreviewInteractiveProps } from '~/types/theme-preview'

const props = defineProps<PreviewInteractiveProps>()
</script>

<template>
  <PreviewTypography :disable-interactive="props.disableInteractive" :palette="props.palette" />
</template>
