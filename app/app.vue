<script setup lang="ts">
import palette_1 from '~/assets/palettes/extreme-sport-landing.json'
import palette_2 from '~/assets/palettes/carbon-and-sulfur.json'

const colorMode = useColorMode()
const isHydrated = ref(false)

const palettes = {
  extremeSportLanding: palette_1,
  carbonAndSulfur: palette_2
} as const

type PaletteKey = keyof typeof palettes

const currentPaletteKey = ref<PaletteKey>('extremeSportLanding')
const currentPalette = computed(() => palettes[currentPaletteKey.value])

const currentMode = computed<'light' | 'dark'>(() => colorMode.value === 'dark' ? 'dark' : 'light')
const dynamicTheme = computed(() => {
  if (!isHydrated.value) {
    return undefined
  }

  return themeBuilder(currentPalette.value.modes[currentMode.value])
})

const paletteOptions = [
  { label: 'Extreme Sport Landing', value: 'extremeSportLanding' },
  { label: 'Carbon and Sulfur', value: 'carbonAndSulfur' }
]

onMounted(() => {
  isHydrated.value = true
})

</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <UContainer class="space-y-6 py-10">
      <div class="flex items-center justify-between gap-4 rounded-xl border border-default bg-elevated/50 px-4 py-3">
        <div class="flex items-center gap-3">
          <USelect v-model="currentPaletteKey" :items="paletteOptions" placeholder="Select palette" />
          <UBadge color="neutral" variant="outline" class="capitalize">
            {{ isHydrated ? currentMode : 'theme' }}
          </UBadge>
          <UColorModeSwitch />
        </div>
      </div>

      <ThemeShowcase :style="dynamicTheme" />
    </UContainer>
  </UApp>
</template>
