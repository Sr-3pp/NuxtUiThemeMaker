<script setup lang="ts">
import type { PaletteDefinition } from '~/types/palette'
import { comparePaletteVersions } from '~/utils/palette-compare'

const props = defineProps<{
  fromPalette: PaletteDefinition
  toPalette: PaletteDefinition
  title?: string
}>()

const comparison = computed(() => comparePaletteVersions(props.fromPalette, props.toPalette, {
  fromVersion: 1,
  toVersion: 2,
}))

const topChanges = computed(() => comparison.value.changes.slice(0, 6))
</script>

<template>
  <UCard variant="outline" class="rounded-2xl shadow-none">
    <template #header>
      <div class="space-y-1">
        <p class="text-sm font-medium text-highlighted">
          {{ props.title ?? 'AI comparison' }}
        </p>
        <p class="text-xs text-muted">
          {{ comparison.totalChanges }} total changes across semantic tokens, ramps, and component layers.
        </p>
      </div>
    </template>

    <div class="space-y-4">
      <div class="grid gap-3 sm:grid-cols-4">
        <div class="rounded-xl border border-default/60 bg-muted/15 px-3 py-3">
          <p class="text-xs uppercase tracking-[0.18em] text-muted">Total</p>
          <p class="mt-1 text-lg font-semibold text-highlighted">{{ comparison.totalChanges }}</p>
        </div>
        <div class="rounded-xl border border-primary/20 bg-primary/5 px-3 py-3">
          <p class="text-xs uppercase tracking-[0.18em] text-muted">Changed</p>
          <p class="mt-1 text-lg font-semibold text-highlighted">{{ comparison.changedCount }}</p>
        </div>
        <div class="rounded-xl border border-success/20 bg-success/5 px-3 py-3">
          <p class="text-xs uppercase tracking-[0.18em] text-muted">Added</p>
          <p class="mt-1 text-lg font-semibold text-highlighted">{{ comparison.addedCount }}</p>
        </div>
        <div class="rounded-xl border border-warning/20 bg-warning/5 px-3 py-3">
          <p class="text-xs uppercase tracking-[0.18em] text-muted">Removed</p>
          <p class="mt-1 text-lg font-semibold text-highlighted">{{ comparison.removedCount }}</p>
        </div>
      </div>

      <div
        v-if="Object.keys(comparison.sectionCounts).length"
        class="flex flex-wrap gap-2"
      >
        <UBadge
          v-for="(count, section) in comparison.sectionCounts"
          :key="section"
          color="neutral"
          variant="soft"
        >
          {{ section }}: {{ count }}
        </UBadge>
      </div>

      <div
        v-if="topChanges.length"
        class="space-y-2"
      >
        <div
          v-for="change in topChanges"
          :key="`${change.path}-${change.after}`"
          class="rounded-xl border border-default/60 bg-muted/15 px-3 py-3"
        >
          <div class="flex flex-wrap items-center gap-2">
            <UBadge color="neutral" variant="outline">{{ change.section }}</UBadge>
            <UBadge
              :color="change.type === 'added' ? 'success' : change.type === 'removed' ? 'warning' : 'primary'"
              variant="soft"
            >
              {{ change.type }}
            </UBadge>
            <p class="text-sm font-medium text-highlighted">
              {{ change.path }}
            </p>
          </div>

          <p class="mt-2 text-xs text-muted">
            {{ change.before ?? 'unset' }} -> {{ change.after ?? 'unset' }}
          </p>
        </div>
      </div>

      <div
        v-else
        class="rounded-xl border border-success/20 bg-success/5 px-4 py-4 text-sm text-muted"
      >
        No token differences were detected.
      </div>
    </div>
  </UCard>
</template>
