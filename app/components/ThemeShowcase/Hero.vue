<script setup lang="ts">
import type { SemanticColorItem, UtilityFamilyItem } from '~/types/theme-showcase'

const props = defineProps<{
  semanticColors: SemanticColorItem[]
  utilityFamilies: UtilityFamilyItem[]
  disableInteractive: boolean
}>()

const emit = defineEmits<{
  'open-export': []
  'update:disableInteractive': [value: boolean]
}>()

function updateDisableInteractive(value: boolean) {
  emit('update:disableInteractive', value)
}
</script>

<template>
  <UCard variant="subtle" class="overflow-hidden">
    <template #header>
      <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div class="space-y-3">
          <div class="flex flex-wrap items-center gap-2">
            <UBadge color="neutral" variant="outline" label="Nuxt UI Theme Builder" />
            <UBadge color="primary" variant="soft" label="Component-first showcase" />
            <UBadge color="secondary" variant="soft" label="Semantic class coverage" />
          </div>

          <div class="space-y-2">
            <h1 class="text-3xl font-semibold tracking-tight text-highlighted lg:text-5xl">
              Theme showcase built with Nuxt UI components
            </h1>
            <p class="max-w-4xl text-sm leading-6 text-toned lg:text-base">
              Preview semantic utilities and real component states in the same screen. This covers the current Nuxt UI utility families used by themes, then applies them through buttons, alerts, forms, navigation and data display.
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <UButton color="primary" variant="solid">
            Preview theme
          </UButton>
          <UButton color="neutral" variant="outline" @click="emit('open-export')">
            Export tokens
          </UButton>
          <div class="inline-flex items-center gap-2 rounded-lg border border-default bg-default px-3 py-2">
            <span class="text-xs text-muted">Quick inspect</span>
            <UKbd value="shift" />
            <UKbd value="t" />
          </div>
        </div>
      </div>
    </template>

    <div class="grid gap-4 lg:grid-cols-4">
      <UCard variant="outline" class="lg:col-span-2">
        <div class="space-y-3">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-highlighted">Coverage summary</p>
              <p class="text-sm text-muted">Semantic utility families currently previewed.</p>
            </div>
            <UBadge color="primary" variant="subtle" :label="`${props.utilityFamilies.length} families`" />
          </div>

          <UTable
            :data="props.utilityFamilies"
            :columns="[
              { accessorKey: 'family', header: 'Family' },
              { accessorKey: 'classes', header: 'Classes' },
              { accessorKey: 'count', header: 'Count' }
            ]"
            sticky="header"
          />
        </div>
      </UCard>

      <UCard variant="soft">
        <template #header>
          <div class="space-y-1">
            <p class="text-sm font-medium text-highlighted">Semantic colors</p>
            <p class="text-sm text-muted">Token aliases used across components.</p>
          </div>
        </template>

        <div class="flex flex-wrap gap-2">
          <UBadge
            v-for="color in props.semanticColors"
            :key="`badge-${color.name}`"
            :color="color.name"
            variant="subtle"
            :label="color.name"
          />
        </div>
      </UCard>

      <UCard variant="soft">
        <template #header>
          <div class="space-y-1">
            <p class="text-sm font-medium text-highlighted">Interactive state</p>
            <p class="text-sm text-muted">Toggle disabled controls globally.</p>
          </div>
        </template>

        <div class="space-y-4">
          <USwitch
            :model-value="props.disableInteractive"
            label="Disable interactive examples"
            @update:model-value="updateDisableInteractive"
          />
          <UProgress :model-value="props.disableInteractive ? 35 : 82" color="secondary" status />
        </div>
      </UCard>
    </div>
  </UCard>
</template>
