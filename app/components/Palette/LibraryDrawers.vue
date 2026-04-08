<script setup lang="ts">
import type { PaletteDefinition } from '~/types/palette'
import type { StoredPalette } from '~/types/palette-store'
import { defaultPalettes, emptyPalette } from '~/utils/paletteRegistry'

const {
  ownPalettesOpen,
  defaultPresetsOpen,
  communityPalettesOpen,
  closeAllDrawers,
} = useDrawers()

const { createEmptyPalette, currentPalette, setCurrentPalette } = usePaletteState()
const { deletePalette, getPublicPalettes, getUserPalettes, updatePaletteVisibility } = usePaletteApi()
const { user } = useAuth()
const { togglePalettesSidebar } = useSidebar()
const { showErrorToast } = useErrorToast()

const { data: userPalettes, refresh: refreshUserPalettes } = await getUserPalettes()
const { data: publicPalettes } = await getPublicPalettes()

function closeLibrary() {
  closeAllDrawers()
  togglePalettesSidebar()
}

function handlePaletteSelect(option: PaletteDefinition | StoredPalette) {
  setCurrentPalette(option)
  closeLibrary()
}

function handleEmptyPaletteSelect() {
  createEmptyPalette()
  closeLibrary()
}

async function handlePaletteDelete(palette: StoredPalette) {
  await deletePalette(palette._id)

  if (currentPalette.value?._id === palette._id) {
    createEmptyPalette()
  }

  await refreshUserPalettes()
}

async function handlePaletteVisibilityToggle(palette: StoredPalette) {
  try {
    const updatedPalette = await updatePaletteVisibility(palette._id, !palette.isPublic)

    if (currentPalette.value?._id === palette._id && updatedPalette) {
      setCurrentPalette(updatedPalette)
    }

    await refreshUserPalettes()
  } catch (error) {
    showErrorToast(error, 'Failed to update palette visibility.')
  }
}

watch(user, async (currentUser) => {
  if (currentUser) {
    await refreshUserPalettes()
    return
  }

  userPalettes.value = []
}, { immediate: true })
</script>

<template>
  <UDrawer
    v-model:open="ownPalettesOpen"
    title="My Palettes"
    description="Your saved palettes. Click to load a palette into the editor, or delete palettes you no longer need."
  >
    <template #body>
      <div class="space-y-4 p-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <PaletteCard
            v-for="palette in userPalettes"
            :key="palette._id"
            :palette="palette"
            badge-label="Saved"
            action-label="Open palette"
            show-visibility-toggle
            show-delete
            @select="handlePaletteSelect(palette)"
            @toggle-visibility="handlePaletteVisibilityToggle(palette)"
            @delete="handlePaletteDelete(palette)"
          />
        </div>
      </div>
    </template>
  </UDrawer>

  <UDrawer
    v-model:open="defaultPresetsOpen"
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

  <UDrawer
    v-model:open="communityPalettesOpen"
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
