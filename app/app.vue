<script setup lang="ts">
import type { PaletteDefinition } from '~/types/palette'
import type { StoredPalette } from '~/types/palette-store'
import { emptyPalette } from '~/utils/paletteRegistry'

const {
  ownPalettesOpen,
  defaultPresetsOpen,
  communityPalettesOpen,
  closeAllDrawers
} = useDrawers()

const { createEmptyPalette, deletePalette, setCurrentPalette, getUserPalettes, getPublicPalettes, defaultPalettes } = usePalette()
const { user } = useAuth()

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

const { data: userPalettes, refresh: refreshUserPalettes } = await getUserPalettes()
const { data: publicPalettes } = await getPublicPalettes()

const handlePaletteDelete = async (palette: StoredPalette) => {
  await deletePalette(palette._id)
  await refreshUserPalettes()
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
  <UApp>
    <NuxtRouteAnnouncer />

    <NuxtPage />

    <UDrawer
      v-model:open="ownPalettesOpen"
    >
      <template #body>
        <div class="space-y-4 p-4">
          <p class="text-sm font-medium">
            My palettes
          </p>

          <div class="grid gap-4">
            <PaletteCard
              v-for="palette in userPalettes"
              :key="palette._id"
              :palette="palette"
              badge-label="Saved"
              action-label="Open palette"
              show-delete
              @select="handlePaletteSelect(palette)"
              @delete="handlePaletteDelete(palette)"
            />
          </div>
        </div>
      </template>
    </UDrawer>
    <UDrawer
      v-model:open="defaultPresetsOpen"
    >
      <template #body>
        <div class="space-y-4 p-4">
          <p class="text-sm font-medium">
            Starter palettes
          </p>

          <div class="grid gap-4">
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
    >
      <template #body>
        <div class="space-y-4 p-4">
          <p class="text-sm font-medium">
            Community palettes
          </p>

          <div class="grid gap-4">
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
  </UApp>
</template>
