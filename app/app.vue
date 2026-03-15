<script setup lang="ts">
import type { PaletteDefinition } from '~/types/palette'
import type { StoredPalette } from '~/types/palette-store'

const {
  ownPalettesOpen,
  defaultPresetsOpen,
  communityPalettesOpen,
  closeAllDrawers
} = useDrawers()

const { createEmptyPalette, setCurrentPalette, getUserPalettes, getPublicPalettes, defaultPalettes } = usePalette()

const { togglePalettesSidebar } = useSidebar()

const handlePaletteSelect = (option: PaletteDefinition | StoredPalette) => {
  setCurrentPalette(option)
  closeAllDrawers()
  togglePalettesSidebar()
}

const handleEmptyPaletteSelect = () => {
  createEmptyPalette()
  closeAllDrawers()
  togglePalettesSidebar()
}

const { data: userPalettes } = await getUserPalettes()
const { data: publicPalettes } = await getPublicPalettes()

</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />

    <NuxtPage />

    <UDrawer
      v-model:open="ownPalettesOpen"
    >
      <template #body>
        <div>
          My palettes
          <ul>
            <li v-for="palette in userPalettes" :key="palette._id">
              {{ palette.name }}
              <button @click="handlePaletteSelect(palette)">
                set palette
              </button>
            </li>
          </ul>
        </div>
      </template>
    </UDrawer>
    <UDrawer
      v-model:open="defaultPresetsOpen"
    >
      <template #body>
        <ul>
          <li>
            Empty palette
            <button @click="handleEmptyPaletteSelect()">
              start from 0
            </button>
          </li>
          <li v-for="(option, i) in defaultPalettes" :key="`default-palettes-${i}`">
            {{ option.name }}
            <button @click="handlePaletteSelect(option)">
              set palette
            </button>
          </li>
        </ul>
      </template>
    </UDrawer>
    <UDrawer
      v-model:open="communityPalettesOpen"
    >
      <template #body>
        <div>
          Community palettes
          <ul>
            <li v-for="palette in publicPalettes" :key="palette._id">
              {{ palette.name }}
              <button @click="handlePaletteSelect(palette)">
                set palette
              </button>
            </li>
          </ul>
        </div>
      </template>
    </UDrawer>
  </UApp>
</template>
