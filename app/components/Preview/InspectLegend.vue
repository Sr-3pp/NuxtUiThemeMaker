<script setup lang="ts">
import type { PreviewAreaKey } from '~/utils/preview-browser'
import { getPreviewAreaDefinition } from '~/utils/preview-browser'

const props = defineProps<{
  area: PreviewAreaKey
}>()

const areaDefinition = computed(() => getPreviewAreaDefinition(props.area))
</script>

<template>
  <UCard
    v-if="areaDefinition"
    variant="soft"
    class="border border-default/70"
  >
    <template #header>
      <div class="space-y-1">
        <p class="text-sm font-medium text-highlighted">
          Inspect applied tokens
        </p>
        <p class="text-xs text-muted">
          {{ areaDefinition.description }}
        </p>
      </div>
    </template>

    <div class="space-y-3">
      <div class="flex flex-wrap gap-2">
        <UBadge v-for="component in areaDefinition.components" :key="component" color="neutral" variant="outline">
          {{ component }}
        </UBadge>
      </div>

      <div class="flex flex-wrap gap-2">
        <UBadge v-for="token in areaDefinition.tokens" :key="token" color="primary" variant="soft">
          {{ token }}
        </UBadge>
      </div>
    </div>
  </UCard>
</template>
