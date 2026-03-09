<script setup lang="ts">
import palette_1 from '~/assets/palettes/extreme-sport-landing.json'
import palette_2 from '~/assets/palettes/carbon-and-sulfur.json'
import type { PaletteDefinition } from '~/types/palette'
import { clonePalette } from '~/utils/palette'

const colorMode = useColorMode()
const isHydrated = ref(false)
const isPaletteEditorOpen = ref(false)

const defaultPalette: PaletteDefinition = {
  name: 'Default',
  modes: {
    light: {},
    dark: {}
  }
}

const palettes = {
  default: defaultPalette,
  extremeSportLanding: palette_1,
  carbonAndSulfur: palette_2
} as const

type PaletteKey = keyof typeof palettes

const paletteDrafts = ref<Record<PaletteKey, PaletteDefinition>>({
  default: clonePalette(defaultPalette),
  extremeSportLanding: clonePalette(palette_1),
  carbonAndSulfur: clonePalette(palette_2)
})

const currentPaletteKey = ref<PaletteKey>('default')
const currentPalette = computed(() => paletteDrafts.value[currentPaletteKey.value])

const currentMode = computed<'light' | 'dark'>(() => colorMode.value === 'dark' ? 'dark' : 'light')
const dynamicTheme = computed(() => {
  if (!isHydrated.value) {
    return undefined
  }

  return themeBuilder(currentPalette.value.modes[currentMode.value])
})

const paletteOptions = computed(() => [
  { label: paletteDrafts.value.default.name, value: 'default' },
  { label: paletteDrafts.value.extremeSportLanding.name, value: 'extremeSportLanding' },
  { label: paletteDrafts.value.carbonAndSulfur.name, value: 'carbonAndSulfur' }
])

function updateCurrentPalette(palette: PaletteDefinition) {
  paletteDrafts.value[currentPaletteKey.value] = clonePalette(palette)
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
          <USelect v-model="currentPaletteKey" :items="paletteOptions" placeholder="Select palette" />
          <UButton color="primary" variant="soft" @click="isPaletteEditorOpen = true">
            Edit palette
          </UButton>
          <UBadge color="neutral" variant="outline" class="capitalize">
            {{ isHydrated ? currentMode : 'theme' }}
          </UBadge>
          <UColorModeSwitch />
        </div>
      </div>

      <ThemeShowcase />
    </UContainer>

    <PaletteEditorDrawer
      v-model:open="isPaletteEditorOpen"
      :palette="currentPalette"
      :default-mode="currentMode"
      @save="updateCurrentPalette"
    />
  </UApp>
</template>
