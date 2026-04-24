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
  <section class="space-y-6">
    <div class="space-y-3">
      <p class="text-sm font-semibold uppercase tracking-widest text-primary">
        Palette gallery
      </p>
      <h2 class="text-3xl font-bold tracking-tight text-highlighted lg:text-4xl">
        Start from shared palettes when you already know the direction.
      </h2>
      <p class="max-w-3xl text-base leading-relaxed text-muted lg:text-lg">
        Public palettes double as inspiration, social proof, and alternate entry points into the editor.
      </p>
    </div>

    <div class="grid gap-5 md:grid-cols-2 lg:gap-6 xl:grid-cols-3">
      <UCard
        v-for="palette in props.palettes"
        :key="palette._id"
        class="group transition-all duration-300 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1"
      >
        <div class="space-y-5">
          <div class="space-y-2.5">
            <div class="flex flex-wrap items-center gap-2.5">
              <UBadge color="neutral" variant="soft" size="md">
                Shared palette
              </UBadge>
              <UBadge color="neutral" variant="outline" size="sm">
                v{{ palette.version }}
              </UBadge>
            </div>
            <h3 class="text-xl font-bold text-highlighted">
              {{ palette.name }}
            </h3>
            <p class="text-sm text-muted">
              /palette/{{ palette.slug }}
            </p>
          </div>

          <div class="flex flex-wrap gap-2.5">
            <span
              v-for="(swatch, index) in swatchesFor(palette)"
              :key="`${palette._id}-${index}`"
              class="block size-9 rounded-full border-2 border-black/10 shadow-sm transition-transform duration-300 group-hover:scale-110"
              :style="{ backgroundColor: swatch ?? 'transparent' }"
            />
          </div>

          <div class="flex flex-wrap gap-3">
            <UButton
              color="primary"
              variant="soft"
              size="md"
              @click="emit('apply', palette)"
            >
              Start from this
            </UButton>
            <UButton
              :to="`/palette/${palette.slug}`"
              color="neutral"
              variant="outline"
              size="md"
            >
              View share page
            </UButton>
          </div>
        </div>
      </UCard>
    </div>
  </section>
</template>
