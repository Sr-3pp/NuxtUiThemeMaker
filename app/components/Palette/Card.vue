<script setup lang="ts">
import type { PaletteDefinition } from '~/types/palette'
import type { StoredPalette } from '~/types/palette-store'
import type { PaletteLifecycleStatus } from '~/types/palette-version'

const props = withDefaults(defineProps<{
  palette: PaletteDefinition | StoredPalette
  actionLabel?: string
  badgeLabel?: string
  showDelete?: boolean
  showHistory?: boolean
  showShare?: boolean
  showVisibilityToggle?: boolean
}>(), {
  actionLabel: 'Use palette',
  badgeLabel: 'Palette',
  showDelete: false,
  showHistory: false,
  showShare: false,
  showVisibilityToggle: false,
})

const emit = defineEmits<{
  select: []
  delete: []
  history: []
  share: []
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

const lifecycleStatus = computed<PaletteLifecycleStatus | null>(() => {
  return storedPalette.value?.lifecycleStatus ?? null
})

const versionLabel = computed(() => {
  if (!storedPalette.value) {
    return null
  }

  return `v${storedPalette.value.version}`
})

const forkSourceLabel = computed(() => {
  if (!storedPalette.value?.forkedFrom) {
    return null
  }

  return `Forked from ${storedPalette.value.forkedFrom.name}`
})

const accessLabel = computed(() => {
  if (!storedPalette.value || storedPalette.value.accessLevel !== 'shared') {
    return null
  }

  return 'Shared with you'
})

const colorTokens = ['primary', 'secondary', 'success', 'info', 'warning', 'error']

const modeSwatches = computed(() => {
  return (['light', 'dark'] as const).map((mode) => {
    const colors = paletteDefinition.value.modes[mode].color ?? {}

    return {
      mode,
      label: mode === 'light' ? 'Light' : 'Dark',
      swatches: colorTokens.map((token) => ({
        token,
        value: colors[token] ?? null,
      })),
    }
  })
})

const availableSwatchCount = computed(() => {
  return modeSwatches.value.reduce((count, mode) => {
    return count + mode.swatches.filter(swatch => swatch.value).length
  }, 0)
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
          <UBadge
            v-if="lifecycleStatus"
            :color="lifecycleStatus === 'published' ? 'success' : 'warning'"
            variant="soft"
          >
            {{ lifecycleStatus }}
          </UBadge>
          <UBadge v-if="visibilityLabel" :color="isPublicPalette ? 'primary' : 'neutral'" variant="soft">
            {{ visibilityLabel }}
          </UBadge>
          <UBadge v-if="versionLabel" color="neutral" variant="outline">
            {{ versionLabel }}
          </UBadge>
          <UBadge color="neutral" variant="soft">
            {{ availableSwatchCount }}/{{ colorTokens.length * modeSwatches.length }}
          </UBadge>
        </div>
      </div>

      <div class="space-y-3">
        <div class="space-y-2 rounded-lg border border-default bg-muted/20 p-3">
          <div
            v-for="mode in modeSwatches"
            :key="mode.mode"
            class="grid grid-cols-[3rem_1fr] items-center gap-2"
          >
            <p class="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
              {{ mode.label }}
            </p>
            <div class="grid grid-cols-6 gap-1.5">
              <div
                v-for="swatch in mode.swatches"
                :key="`${mode.mode}-${swatch.token}`"
                class="h-5 rounded-md border border-default bg-muted/60"
                :title="`${mode.label} ${swatch.token}`"
                :style="swatch.value ? { backgroundColor: swatch.value } : undefined"
              />
            </div>
          </div>

          <div class="grid grid-cols-[3rem_1fr] items-center gap-2">
            <span aria-hidden="true" />
            <div class="grid grid-cols-6 gap-1.5">
              <p
                v-for="token in colorTokens"
                :key="token"
                class="truncate text-[10px] uppercase tracking-[0.08em] text-muted"
              >
                {{ token }}
              </p>
            </div>
          </div>
        </div>

        <p class="text-sm text-muted">
          {{
            availableSwatchCount
              ? 'Light and dark palette colors at a glance.'
              : 'Blank palette ready to be filled.'
          }}
        </p>
        <p v-if="forkSourceLabel" class="text-xs text-muted">
          {{ forkSourceLabel }}
        </p>
        <p v-if="accessLabel" class="text-xs text-muted">
          {{ accessLabel }}
        </p>
      </div>

      <div class="flex gap-2">
        <UButton block color="neutral" variant="outline" @click="emit('select')">
          {{ actionLabel }}
        </UButton>
        <UButton
          v-if="showHistory"
          color="neutral"
          variant="soft"
          icon="i-lucide-history"
          aria-label="Open palette history"
          @click="emit('history')"
        />
        <UButton
          v-if="showShare"
          color="neutral"
          variant="soft"
          icon="i-lucide-users"
          aria-label="Manage palette sharing"
          @click="emit('share')"
        />
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
