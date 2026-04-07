<script setup lang="ts">
import type { TimelineItem } from '@nuxt/ui'
import type { PreviewInteractiveProps } from '~/types/theme-preview'

defineProps<PreviewInteractiveProps>()

const timelineItems: TimelineItem[] = [
  {
    date: 'Step 1',
    title: 'Semantic tokens tuned',
    description: 'Primary, neutral and status colors now read consistently on default surfaces.',
    icon: 'i-lucide-palette',
  },
  {
    date: 'Step 2',
    title: 'Component overrides applied',
    description: 'Button and input overrides are visible in the live workbench.',
    icon: 'i-lucide-sliders-horizontal',
  },
  {
    date: 'Step 3',
    title: 'Preview QA pass',
    description: 'Coverage expanded for overlays, empty states and operational UI patterns.',
    icon: 'i-lucide-check-circle-2',
  },
]
</script>

<template>
  <section class="space-y-4">
    <div class="space-y-1">
      <h3 class="text-lg font-semibold text-highlighted">
        Empty states and progressions
      </h3>
      <p class="text-sm text-muted">
        Empty states, CTAs and step-based communication patterns for production dashboards and product flows.
      </p>
    </div>

    <div class="grid gap-6 xl:grid-cols-[1fr_1.05fr]">
      <UCard variant="outline">
        <template #header>
          <p class="text-sm font-medium text-highlighted">Empty state</p>
        </template>

        <div class="rounded-3xl border border-default bg-default p-4">
          <UEmpty
            icon="i-lucide-inbox"
            title="No palettes published yet"
            description="Create a first public palette to check how empty-state copy, icon color and call-to-action emphasis feel inside the current theme."
            :actions="[
              { label: 'Create palette', color: 'primary' },
              { label: 'Import theme', color: 'neutral', variant: 'outline' }
            ]"
          />
        </div>
      </UCard>

      <UCard variant="soft">
        <template #header>
          <p class="text-sm font-medium text-highlighted">Timeline</p>
        </template>

        <div class="rounded-3xl border border-default bg-default p-5">
          <UTimeline
            :items="timelineItems"
            color="primary"
            default-value="1"
          />
        </div>
      </UCard>
    </div>
  </section>
</template>
