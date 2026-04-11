<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <div class="space-y-1">
    <h3 class="text-lg font-semibold text-highlighted">
      {{ title }}
    </h3>
    <p class="text-sm text-muted">
      {{ description }}
    </p>
  </div>
</template>
