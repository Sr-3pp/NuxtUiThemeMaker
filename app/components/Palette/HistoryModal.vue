<script setup lang="ts">
const {
  historyPalette,
  paletteHistory,
  isHistoryLoading,
  isOpen,
} = usePaletteHistoryModal()

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="historyPalette ? `${historyPalette.name} history` : 'Palette history'"
    description="Saved versions and lifecycle changes for this palette."
  >
    <template #body>
      <div class="space-y-3">
        <div
          v-if="historyPalette"
          class="flex justify-end"
        >
          <UButton
            :to="`/palette/${historyPalette.slug}/history`"
            color="neutral"
            variant="soft"
            icon="i-lucide-panels-top-left"
          >
            Open full history view
          </UButton>
        </div>

        <div
          v-if="isHistoryLoading"
          class="rounded-2xl border border-default px-4 py-4 text-sm text-muted"
        >
          Loading history...
        </div>

        <div
          v-else-if="!paletteHistory.length"
          class="rounded-2xl border border-default px-4 py-4 text-sm text-muted"
        >
          No version history is available yet.
        </div>

        <template v-else>
          <div
            v-for="entry in paletteHistory"
            :key="entry.id"
            class="rounded-2xl border border-default px-4 py-4"
          >
            <div class="flex flex-wrap items-center gap-2">
              <UBadge color="neutral" variant="outline">
                v{{ entry.version }}
              </UBadge>
              <UBadge :color="entry.lifecycleStatus === 'published' ? 'success' : 'warning'" variant="soft">
                {{ entry.lifecycleStatus }}
              </UBadge>
              <UBadge color="neutral" variant="soft">
                {{ entry.event }}
              </UBadge>
            </div>

            <p class="mt-2 text-sm font-medium text-highlighted">
              {{ entry.name }}
            </p>
            <p class="mt-1 text-xs text-muted">
              {{ formatDate(entry.createdAt) }}
            </p>
          </div>
        </template>
      </div>
    </template>
  </UModal>
</template>
