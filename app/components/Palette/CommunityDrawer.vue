<script setup lang="ts">
import type { StoredPalette } from '~/types/palette-store'

const { isOpen, close } = useModal('community-palettes')
const { getPublicPalettes } = usePaletteApi()
const { setCurrentPalette } = usePaletteState()
const { closePalettesSidebar } = useSidebar()

const { data: publicPalettes } = await getPublicPalettes()

function closeLibrary() {
  close()
  closePalettesSidebar()
}

function handlePaletteSelect(palette: StoredPalette) {
  setCurrentPalette(palette)
  closeLibrary()
}
</script>

<template>
  <UDrawer
    v-model:open="isOpen"
    title="Community Palettes"
    description="Palettes shared by the community. Click to load a palette into the editor."
  >
    <template #body>
      <div class="space-y-4 p-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <PaletteCard
            v-for="palette in publicPalettes"
            :key="palette._id"
            :palette="palette"
            badge-label="Community"
            action-label="Open palette"
            @select="handlePaletteSelect(palette)"
          />
        </div>
      </div>
    </template>
  </UDrawer>
</template>
