<script setup lang="ts">
import type { PaletteDefinition } from '~/types/palette'
import { clonePalette } from '~/utils/palette'
import { defaultPalette, paletteOptions } from '~/utils/paletteRegistry'

const colorMode = useColorMode()
const isHydrated = ref(false)
const isPaletteImportOpen = ref(false)
const isPaletteEditorOpen = ref(false)

const selectPaletteOptions = paletteOptions.map(option => ({
  label: option.name,
  value: option.id,
  description: option.type === 'default'
    ? 'Start from the stock Nuxt UI theme with no custom overrides.'
    : 'Use this preset as a starting template, then edit tokens.'
}))

type PaletteOptionId = typeof paletteOptions[number]['id']

const currentPaletteId = ref<PaletteOptionId>('default')
const paletteDrafts = ref<Record<PaletteOptionId, PaletteDefinition>>(
  Object.fromEntries(
    paletteOptions.map(option => [
      option.id,
      clonePalette(option.type === 'preset' ? option.palette : defaultPalette)
    ])
  ) as Record<PaletteOptionId, PaletteDefinition>
)
const currentEditablePalette = computed(() => paletteDrafts.value[currentPaletteId.value])
function hasPaletteOverrides(palette: PaletteDefinition) {
  return Object.values(palette.modes).some(mode =>
    Object.values(mode).some(section =>
      Object.values(section).some(token => token != null)
    )
  )
}

const currentPalette = computed<PaletteDefinition | null>(() =>
  currentPaletteId.value === 'default' && !hasPaletteOverrides(currentEditablePalette.value)
    ? null
    : currentEditablePalette.value
)

const currentMode = computed<'light' | 'dark'>(() => colorMode.value === 'dark' ? 'dark' : 'light')
const dynamicTheme = computed(() => {
  if (!isHydrated.value || !currentPalette.value) {
    return undefined
  }

  return themeBuilder(currentPalette.value.modes[currentMode.value])
})

const currentPaletteStatus = computed(() =>
  currentPalette.value ? 'Custom palette' : 'Nuxt UI defaults'
)

function updateCurrentPalette(palette: PaletteDefinition) {
  paletteDrafts.value[currentPaletteId.value] = clonePalette(palette)
}

function importPalette(palette: PaletteDefinition) {
  updateCurrentPalette(palette)
  isPaletteImportOpen.value = false
}

onMounted(() => {
  isHydrated.value = true
})
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <UContainer class="space-y-5 py-6 lg:py-8">
      <div class="sticky top-4 z-20 rounded-2xl border border-default/80 bg-default/90 shadow-sm backdrop-blur">
        <div class="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div class="min-w-0 space-y-1">
            <p class="text-[11px] font-medium uppercase tracking-[0.22em] text-muted">
              Nuxt UI Theme Builder
            </p>
            <div class="flex flex-wrap items-center gap-2">
              <h1 class="text-lg font-semibold tracking-tight text-highlighted">
                {{ currentEditablePalette.name }}
              </h1>
              <UBadge color="neutral" variant="outline" class="capitalize">
                {{ isHydrated ? currentMode : 'theme' }}
              </UBadge>
              <UBadge :color="currentPalette ? 'primary' : 'neutral'" :variant="currentPalette ? 'soft' : 'outline'">
                {{ currentPaletteStatus }}
              </UBadge>
            </div>
            <p class="text-sm text-muted">
              Select a palette, adjust tokens, inspect the preview, then export the result.
            </p>
          </div>

          <div class="flex flex-col gap-3 lg:items-end">
            <div class="flex flex-wrap items-center gap-2">
              <div class="min-w-72 space-y-1">
                <p class="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
                  Start From Template
                </p>
                <USelect
                  v-model="currentPaletteId"
                  :items="selectPaletteOptions"
                  placeholder="Choose a preset or start from Nuxt UI defaults"
                />
              </div>
              <UButton color="neutral" variant="outline" @click="isPaletteImportOpen = true">
                Import
              </UButton>
              <UButton color="primary" @click="isPaletteEditorOpen = true">
                Edit tokens
              </UButton>
              <UColorModeSwitch />
            </div>
            <p class="text-xs text-muted lg:text-right">
              Live preview updates immediately in the workspace below.
            </p>
          </div>
        </div>
      </div>

      <ThemeShowcase
        :export-palette="currentEditablePalette"
        :preview-style="dynamicTheme"
        :preview-mode="currentMode"
        :is-using-default-theme="!currentPalette"
      />
    </UContainer>

    <PaletteImportModal
      v-model:open="isPaletteImportOpen"
      @import="importPalette"
    />

    <PaletteEditorDrawer
      v-model:open="isPaletteEditorOpen"
      :palette="currentEditablePalette"
      :default-mode="currentMode"
      @save="updateCurrentPalette"
    />
  </UApp>
</template>
