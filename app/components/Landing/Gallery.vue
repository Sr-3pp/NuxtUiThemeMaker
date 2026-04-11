<script setup lang="ts">
import type { StoredPalette } from '~/types/palette-store'

const props = defineProps<{
  palettes: StoredPalette[]
}>()

const emit = defineEmits<{
  apply: [palette: StoredPalette]
}>()

function swatchesFor(palette: StoredPalette) {
  const colors = palette.palette.modes.light.color ?? {}

  return ['primary', 'secondary', 'success', 'warning', 'neutral']
    .map(token => colors[token] ?? null)
    .filter(Boolean)
}
</script>

<template>
  <section class="space-y-4">
    <div class="space-y-2">
      <p class="text-xs uppercase tracking-[0.2em] text-primary">
        Palette gallery
      </p>
      <h2 class="text-3xl font-semibold tracking-tight text-highlighted">
        Start from shared palettes when you already know the direction.
      </h2>
      <p class="max-w-3xl text-sm leading-6 text-muted">
        Public palettes double as inspiration, social proof, and alternate entry points into the editor.
      </p>
    </div>

    <div class="grid gap-4 xl:grid-cols-3">
      <UCard
        v-for="palette in props.palettes"
        :key="palette._id"
        class="rounded-[1.5rem] border-default/70 bg-default/85"
      >
        <div class="space-y-4">
          <div class="space-y-2">
            <div class="flex flex-wrap items-center gap-2">
              <UBadge color="neutral" variant="soft">
                Shared palette
              </UBadge>
              <UBadge color="neutral" variant="outline">
                v{{ palette.version }}
              </UBadge>
            </div>
            <h3 class="text-lg font-medium text-highlighted">
              {{ palette.name }}
            </h3>
            <p class="text-sm text-muted">
              /palette/{{ palette.slug }}
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <span
              v-for="(swatch, index) in swatchesFor(palette)"
              :key="`${palette._id}-${index}`"
              class="block size-8 rounded-full border border-black/10"
              :style="{ backgroundColor: swatch ?? 'transparent' }"
            />
          </div>

          <div class="flex flex-wrap gap-3">
            <UButton
              color="primary"
              variant="soft"
              size="sm"
              @click="emit('apply', palette)"
            >
              Start from this
            </UButton>
            <UButton
              :to="`/palette/${palette.slug}`"
              color="neutral"
              variant="outline"
              size="sm"
            >
              View share page
            </UButton>
          </div>
        </div>
      </UCard>
    </div>
  </section>
</template>
