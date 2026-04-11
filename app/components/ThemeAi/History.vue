<script setup lang="ts">
import type { PaletteAiResultHistoryEntry } from '~/types/palette-generation'

const props = defineProps<{
  entries: PaletteAiResultHistoryEntry<unknown>[]
  selectedId?: number | null
  title?: string
}>()

defineEmits<{
  select: [id: number]
}>()

function formatHistoryTimestamp(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}
</script>

<template>
  <div
    v-if="props.entries.length > 1"
    class="space-y-2"
  >
    <p class="text-xs font-medium uppercase tracking-[0.18em] text-muted">
      {{ props.title ?? 'Recent runs' }}
    </p>
    <div class="flex flex-wrap gap-2">
      <UButton
        v-for="entry in props.entries"
        :key="entry.id"
        size="xs"
        :color="props.selectedId === entry.id ? 'primary' : 'neutral'"
        :variant="props.selectedId === entry.id ? 'solid' : 'outline'"
        @click="$emit('select', entry.id)"
      >
        <span class="flex flex-col items-start text-left">
          <span>{{ entry.label }}</span>
          <span class="text-[10px] opacity-70">{{ entry.detail ?? formatHistoryTimestamp(entry.createdAt) }}</span>
        </span>
      </UButton>
    </div>
  </div>
</template>
