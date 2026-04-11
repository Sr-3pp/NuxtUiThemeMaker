<script setup lang="ts">
import type { PaletteDefinition } from '~/types/palette'
import type { StoredPalette } from '~/types/palette-store'

const { isOpen, close } = useModal('own-palettes')
const { createEmptyPalette, currentPalette, setCurrentPalette } = usePaletteState()
const { deletePalette, getUserPalettes, updatePaletteVisibility } = usePaletteApi()
const { user } = useAuth()
const { closePalettesSidebar } = useSidebar()
const { showErrorToast } = useErrorToast()
const { openPaletteHistory } = usePaletteHistoryModal()
const { openPaletteShare } = usePaletteShareModal()

const { data: userPalettes, refresh: refreshUserPalettes } = await getUserPalettes()

const ownedPalettes = computed(() => {
  return (userPalettes.value ?? []).filter(palette => palette.accessLevel === 'owner')
})

const sharedPalettes = computed(() => {
  return (userPalettes.value ?? []).filter(palette => palette.accessLevel === 'shared')
})

function closeLibrary() {
  close()
  closePalettesSidebar()
}

async function openLibraryModal(onOpen: () => void) {
  closeLibrary()
  await nextTick()
  onOpen()
}

function handlePaletteSelect(option: PaletteDefinition | StoredPalette) {
  setCurrentPalette(option)
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

async function handlePaletteHistoryOpen(palette: StoredPalette) {
  await openLibraryModal(() => void openPaletteHistory(palette))
}

async function handlePaletteShareOpen(palette: StoredPalette) {
  await openLibraryModal(() => openPaletteShare(palette))
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
    v-model:open="isOpen"
    title="My Palettes"
    description="Your own palettes and any private palettes shared with you."
  >
    <template #body>
      <div class="space-y-4 p-4">
        <div class="space-y-3">
          <p class="text-sm font-medium text-highlighted">
            Owned by you
          </p>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <PaletteCard
              v-for="palette in ownedPalettes"
              :key="palette._id"
              :palette="palette"
              badge-label="Saved"
              action-label="Open palette"
              show-history
              show-share
              show-visibility-toggle
              show-delete
              @select="handlePaletteSelect(palette)"
              @history="handlePaletteHistoryOpen(palette)"
              @share="handlePaletteShareOpen(palette)"
              @toggle-visibility="handlePaletteVisibilityToggle(palette)"
              @delete="handlePaletteDelete(palette)"
            />
          </div>
        </div>

        <div v-if="sharedPalettes.length" class="space-y-3">
          <p class="text-sm font-medium text-highlighted">
            Shared with you
          </p>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <PaletteCard
              v-for="palette in sharedPalettes"
              :key="palette._id"
              :palette="palette"
              badge-label="Shared"
              action-label="Open shared palette"
              show-history
              @select="handlePaletteSelect(palette)"
              @history="handlePaletteHistoryOpen(palette)"
            />
          </div>
        </div>
      </div>
    </template>
  </UDrawer>
</template>
