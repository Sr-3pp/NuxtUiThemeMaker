<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  description?: string
  variant?: string
  cardClass?: string
}>(), {
  description: undefined,
  variant: 'outline',
  cardClass: undefined,
})
</script>

<template>
  <UCard :variant="variant" :class="cardClass">
    <template #header>
      <div class="space-y-1">
        <p class="text-sm font-medium text-highlighted">
          {{ title }}
        </p>
        <p v-if="description" class="text-sm text-muted">
          {{ description }}
        </p>
      </div>
    </template>

    <slot />
  </UCard>
</template>
