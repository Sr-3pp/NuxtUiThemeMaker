<script setup lang="ts">
import type { PreviewInteractiveProps } from '~/types/theme-preview'

defineProps<PreviewInteractiveProps>()

const selectedCommand = ref()

const commandGroups = [
  {
    id: 'theme',
    label: 'Theme actions',
    items: [
      {
        label: 'Open semantic tokens',
        description: 'Inspect the semantic token editor',
        icon: 'i-lucide-palette',
        kbds: ['G', 'T'],
      },
      {
        label: 'Review component overrides',
        description: 'Jump to button, input and state overrides',
        icon: 'i-lucide-sliders-horizontal',
        kbds: ['G', 'C'],
      },
    ],
  },
  {
    id: 'preview',
    label: 'Preview QA',
    items: [
      {
        label: 'Compare light and dark',
        description: 'Open split preview mode for regression checks',
        icon: 'i-lucide-columns-2',
        kbds: ['G', 'P'],
      },
      {
        label: 'Inspect empty states',
        description: 'Review empty-state copy and CTA emphasis',
        icon: 'i-lucide-inbox',
        kbds: ['G', 'E'],
      },
      {
        label: 'Audit feedback colors',
        description: 'Check alerts, progress bars and skeleton visibility',
        icon: 'i-lucide-badge-alert',
        kbds: ['G', 'F'],
      },
    ],
  },
]
</script>

<template>
  <section class="space-y-4">
    <PreviewSectionIntro
      title="Command palette"
      description="Embedded command palette coverage for grouped search, keyboard hints and compact action density."
    />

    <PreviewCard title="Command browser">
      <div class="rounded-3xl border border-default bg-default p-3">
        <UCommandPalette
          v-model="selectedCommand"
          :groups="commandGroups"
          placeholder="Search preview actions"
          icon="i-lucide-search"
          :close="false"
          :back="false"
        />
      </div>
    </PreviewCard>
  </section>
</template>
