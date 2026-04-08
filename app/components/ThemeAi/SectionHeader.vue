<script setup lang="ts">
defineProps<{
  title: string
  description: string
  actionLabel?: string
}>()

defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="flex items-start justify-between gap-3">
    <div class="space-y-1">
      <p class="text-sm font-medium text-highlighted">
        {{ title }}
      </p>
      <p class="text-xs text-muted">
        {{ description }}
      </p>
    </div>

    <UButton
      v-if="actionLabel"
      color="neutral"
      variant="ghost"
      size="xs"
      @click="$emit('action')"
    >
      {{ actionLabel }}
    </UButton>
  </div>
</template>
