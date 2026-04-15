<script setup lang="ts">
import type { PaletteDefinition } from '~/types/palette'

const props = defineProps<{
  isSaved?: boolean
  isSaving?: boolean
  palette: PaletteDefinition | null
  prompt: string
}>()

const emit = defineEmits<{
  edit: []
  export: []
  regenerate: []
  save: []
}>()

const swatches = computed(() => {
  if (!props.palette) {
    return []
  }

  const lightColors = props.palette.modes.light.color ?? {}

  return ['primary', 'secondary', 'success', 'warning', 'error', 'neutral']
    .map(token => ({ token, value: lightColors[token] ?? null }))
    .filter(swatch => Boolean(swatch.value))
})
</script>

<template>
  <UCard
    v-if="props.palette"
    class="border-primary/30 shadow-2xl shadow-primary/5"
  >
    <div class="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
      <div class="flex-1 space-y-5">
        <div class="flex flex-wrap items-center gap-2.5">
          <UBadge color="primary" variant="soft" size="lg" class="px-3 py-1">
            Generated palette
          </UBadge>
          <UBadge color="neutral" variant="outline" size="md">
            Live on this page
          </UBadge>
          <UBadge color="success" variant="soft" size="md">
            Light + dark modes
          </UBadge>
        </div>

        <div class="space-y-3">
          <h2 class="text-3xl font-bold text-highlighted lg:text-4xl">
            {{ props.palette.name }}
          </h2>
          <p class="max-w-3xl text-base leading-relaxed text-muted">
            {{ props.prompt }}
          </p>
        </div>

        <div class="flex flex-wrap gap-4">
          <div
            v-for="swatch in swatches"
            :key="swatch.token"
            class="group rounded-xl border border-default bg-elevated px-4 py-3 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/40"
          >
            <div class="flex items-center gap-3.5">
              <span
                class="block size-7 rounded-full border-2 border-black/10 shadow-sm transition-transform duration-300 group-hover:scale-110"
                :style="{ backgroundColor: swatch.value ?? 'transparent' }"
              />
              <div class="space-y-0.5">
                <p class="text-xs font-semibold uppercase tracking-widest text-muted">
                  {{ swatch.token }}
                </p>
                <p class="text-sm font-bold text-highlighted">
                  {{ swatch.value }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid gap-3 sm:min-w-64 lg:min-w-72">
        <UButton color="primary" size="lg" icon="i-lucide-pencil-ruler" @click="emit('edit')">
          Edit in editor
        </UButton>
        <UButton
          color="neutral"
          variant="outline"
          size="lg"
          icon="i-lucide-save"
          :loading="props.isSaving"
          @click="emit('save')"
        >
          {{ props.isSaved ? 'Saved to library' : 'Save palette' }}
        </UButton>
        <UButton color="neutral" variant="soft" size="lg" icon="i-lucide-download" @click="emit('export')">
          Export JSON
        </UButton>
        <UButton color="neutral" variant="ghost" size="lg" icon="i-lucide-refresh-cw" @click="emit('regenerate')">
          Regenerate
        </UButton>
      </div>
    </div>
  </UCard>
</template>
