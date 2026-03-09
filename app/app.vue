<script setup lang="ts">
import type { PaletteDefinition } from '~/types/palette'
import { clonePalette } from '~/utils/palette'
import { defaultPalette, paletteOptions } from '~/utils/paletteRegistry'

const colorMode = useColorMode()
const isHydrated = ref(false)
const isPaletteEditorOpen = ref(false)

const selectPaletteOptions = paletteOptions.map(option => ({
  label: option.name,
  value: option.id
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

function updateCurrentPalette(palette: PaletteDefinition) {
  paletteDrafts.value[currentPaletteId.value] = clonePalette(palette)
}

onMounted(() => {
  isHydrated.value = true
})
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <UContainer class="space-y-6 py-10" :style="dynamicTheme">
      <div class="flex items-center justify-between gap-4 rounded-xl border border-default bg-elevated/50 px-4 py-3">
        <div class="flex items-center gap-3">
          <USelect v-model="currentPaletteId" :items="selectPaletteOptions" placeholder="Select palette" />
          <UButton color="primary" variant="soft" @click="isPaletteEditorOpen = true">
            Edit palette
          </UButton>
          <UBadge color="neutral" variant="outline" class="capitalize">
            {{ isHydrated ? currentMode : 'theme' }}
          </UBadge>
          <UColorModeSwitch />
        </div>
      </div>

      <ThemeShowcase :export-palette="currentEditablePalette" />
    </UContainer>

    <PaletteEditorDrawer
      v-model:open="isPaletteEditorOpen"
      :palette="currentEditablePalette"
      :default-mode="currentMode"
      @save="updateCurrentPalette"
    />
  </UApp>
</template>
