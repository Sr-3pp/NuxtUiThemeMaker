<script setup lang="ts">
defineProps<{
  disableInteractive: boolean
}>()
</script>

<template>
  <ThemePreviewGallery :disable-interactive="disableInteractive" />
</template>
