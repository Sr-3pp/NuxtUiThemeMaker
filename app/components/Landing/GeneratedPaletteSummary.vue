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
    class="rounded-[1.75rem] border-default/70 bg-default/85 shadow-xl"
  >
    <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div class="space-y-4">
        <div class="flex flex-wrap items-center gap-2">
          <UBadge color="primary" variant="soft">
            Generated palette
          </UBadge>
          <UBadge color="neutral" variant="outline">
            Live on this page
          </UBadge>
          <UBadge color="success" variant="soft">
            Light + dark modes
          </UBadge>
        </div>

        <div class="space-y-2">
          <h2 class="text-2xl font-semibold text-highlighted">
            {{ props.palette.name }}
          </h2>
          <p class="max-w-3xl text-sm leading-6 text-muted">
            {{ props.prompt }}
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <div
            v-for="swatch in swatches"
            :key="swatch.token"
            class="rounded-2xl border border-default/70 bg-default/75 px-3 py-2"
          >
            <div class="flex items-center gap-3">
              <span
                class="block size-6 rounded-full border border-black/10"
                :style="{ backgroundColor: swatch.value ?? 'transparent' }"
              />
              <div>
                <p class="text-xs uppercase tracking-[0.14em] text-muted">
                  {{ swatch.token }}
                </p>
                <p class="text-sm font-medium text-highlighted">
                  {{ swatch.value }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid gap-3 sm:min-w-[260px]">
        <UButton color="primary" icon="i-lucide-pencil-ruler" @click="emit('edit')">
          Edit in editor
        </UButton>
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-save"
          :loading="props.isSaving"
          @click="emit('save')"
        >
          {{ props.isSaved ? 'Saved to library' : 'Save palette' }}
        </UButton>
        <UButton color="neutral" variant="soft" icon="i-lucide-download" @click="emit('export')">
          Export JSON
        </UButton>
        <UButton color="neutral" variant="ghost" icon="i-lucide-refresh-cw" @click="emit('regenerate')">
          Regenerate
        </UButton>
      </div>
    </div>
  </UCard>
</template>
