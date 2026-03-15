<script setup lang="ts">
import type { PaletteDefinition } from '~/types/palette'
import type { StoredPalette } from '~/types/palette-store'

const props = withDefaults(defineProps<{
  palette: PaletteDefinition | StoredPalette
  actionLabel?: string
  badgeLabel?: string
  showDelete?: boolean
  showVisibilityToggle?: boolean
}>(), {
  actionLabel: 'Use palette',
  badgeLabel: 'Palette',
  showDelete: false,
  showVisibilityToggle: false,
})

const emit = defineEmits<{
  select: []
  delete: []
  toggleVisibility: []
}>()

const paletteDefinition = computed<PaletteDefinition>(() => {
  return '_id' in props.palette ? props.palette.palette : props.palette
})

function getStoredPalette(palette: PaletteDefinition | StoredPalette): StoredPalette | null {
  return '_id' in palette ? palette : null
}

const storedPalette = computed(() => {
  return getStoredPalette(props.palette)
})

const isPublicPalette = computed(() => {
  return storedPalette.value?.isPublic ?? false
})

const visibilityLabel = computed(() => {
  if (!storedPalette.value) {
    return null
  }

  return isPublicPalette.value ? 'Public' : 'Private'
})

const swatches = computed(() => {
  const lightColors = paletteDefinition.value.modes.light.color ?? {}
  const darkColors = paletteDefinition.value.modes.dark.color ?? {}
  const tokens = ['primary', 'secondary', 'success', 'info', 'warning', 'error']

  return tokens.map((token) => ({
    token,
    value: lightColors[token] ?? darkColors[token] ?? null,
  }))
})
</script>

<template>
  <UCard
    variant="outline"
    class="rounded-3xl border-default bg-default/70 transition-colors hover:bg-muted/50"
  >
    <div class="space-y-4">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0 space-y-1">
          <p class="text-xs font-medium uppercase tracking-[0.18em] text-muted">
            {{ badgeLabel }}
          </p>
          <p class="truncate text-base font-semibold">
            {{ paletteDefinition.name }}
          </p>
        </div>

        <div class="flex shrink-0 gap-2">
          <UBadge v-if="visibilityLabel" :color="isPublicPalette ? 'primary' : 'neutral'" variant="soft">
            {{ visibilityLabel }}
          </UBadge>
          <UBadge color="neutral" variant="soft">
            {{ swatches.filter(swatch => swatch.value).length }}/{{ swatches.length }}
          </UBadge>
        </div>
      </div>

      <div class="space-y-2">
        <div class="grid grid-cols-6 gap-2">
          <div
            v-for="swatch in swatches"
            :key="swatch.token"
            class="space-y-2"
          >
            <div
              class="h-12 rounded-2xl border border-default bg-muted/60"
              :style="swatch.value ? { backgroundColor: swatch.value } : undefined"
            />
            <p class="truncate text-[11px] uppercase tracking-[0.14em] text-muted">
              {{ swatch.token }}
            </p>
          </div>
        </div>

        <p class="text-sm text-muted">
          {{
            swatches.some(swatch => swatch.value)
              ? 'Main palette colors at a glance.'
              : 'Blank palette ready to be filled.'
          }}
        </p>
      </div>

      <div class="flex gap-2">
        <UButton block color="neutral" variant="outline" @click="emit('select')">
          {{ actionLabel }}
        </UButton>
        <UButton
          v-if="showVisibilityToggle"
          :color="isPublicPalette ? 'primary' : 'neutral'"
          variant="soft"
          :icon="isPublicPalette ? 'i-lucide-globe' : 'i-lucide-lock'"
          :aria-label="isPublicPalette ? 'Make palette private' : 'Make palette public'"
          @click="emit('toggleVisibility')"
        />
        <UButton
          v-if="showDelete"
          color="error"
          variant="soft"
          icon="i-lucide-trash-2"
          aria-label="Delete palette"
          @click="emit('delete')"
        />
      </div>
    </div>
  </UCard>
</template>
