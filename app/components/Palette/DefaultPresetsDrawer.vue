<script setup lang="ts">
import type { PaletteDefinition } from '~/types/palette'
import { defaultPalettes, emptyPalette } from '~/utils/paletteRegistry'

const { isOpen, close } = useModal('default-presets')
const { createEmptyPalette, setCurrentPalette } = usePaletteState()
const { closePalettesSidebar } = useSidebar()

function closeLibrary() {
  close()
  closePalettesSidebar()
}

function handlePaletteSelect(option: PaletteDefinition) {
  setCurrentPalette(option)
  closeLibrary()
}

function handleEmptyPaletteSelect() {
  createEmptyPalette()
  closeLibrary()
}
</script>

<template>
  <UDrawer
    v-model:open="isOpen"
    title="Starter Presets"
    description="Predefined palettes to get you started. Click to load a palette into the editor."
  >
    <template #body>
      <div class="space-y-4 p-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <PaletteCard
            :palette="emptyPalette"
            badge-label="Blank"
            action-label="Open blank palette"
            @select="handleEmptyPaletteSelect()"
          />

          <PaletteCard
            v-for="(option, i) in defaultPalettes"
            :key="`default-palettes-${i}`"
            :palette="option"
            badge-label="Preset"
            action-label="Use preset"
            @select="handlePaletteSelect(option)"
          />
        </div>
      </div>
    </template>
  </UDrawer>
</template>
