<script setup lang="ts">
import type { PaletteDefinition } from '~/types/palette'
import type { StoredPalette } from '~/types/palette-store'
import type { PaletteVersionSnapshot } from '~/types/palette-version'
import { defaultPalettes, emptyPalette } from '~/utils/paletteRegistry'

const {
  ownPalettesOpen,
  defaultPresetsOpen,
  communityPalettesOpen,
  closeAllDrawers,
} = useDrawers()

const { createEmptyPalette, currentPalette, setCurrentPalette } = usePaletteState()
const { deletePalette, getPaletteHistory, getPublicPalettes, getUserPalettes, updatePaletteVisibility } = usePaletteApi()
const { user } = useAuth()
const { togglePalettesSidebar } = useSidebar()
const { showErrorToast } = useErrorToast()
const isHistoryOpen = ref(false)
const isHistoryLoading = ref(false)
const historyPalette = ref<StoredPalette | null>(null)
const paletteHistory = ref<PaletteVersionSnapshot[]>([])

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

async function handlePaletteHistoryOpen(palette: StoredPalette) {
  historyPalette.value = palette
  isHistoryOpen.value = true
  isHistoryLoading.value = true

  try {
    paletteHistory.value = await getPaletteHistory(palette._id)
  } catch (error) {
    paletteHistory.value = []
    showErrorToast(error, 'Failed to load palette history.')
  } finally {
    isHistoryLoading.value = false
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
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
  <UModal
    v-model:open="isHistoryOpen"
    :title="historyPalette ? `${historyPalette.name} history` : 'Palette history'"
    description="Saved versions and lifecycle changes for this palette."
  >
    <template #body>
      <div class="space-y-3">
        <div
          v-if="historyPalette"
          class="flex justify-end"
        >
          <UButton
            :to="`/palette/${historyPalette.slug}/history`"
            color="neutral"
            variant="soft"
            icon="i-lucide-panels-top-left"
          >
            Open full history view
          </UButton>
        </div>

        <div
          v-if="isHistoryLoading"
          class="rounded-2xl border border-default px-4 py-4 text-sm text-muted"
        >
          Loading history...
        </div>

        <div
          v-else-if="!paletteHistory.length"
          class="rounded-2xl border border-default px-4 py-4 text-sm text-muted"
        >
          No version history is available yet.
        </div>

        <template v-else>
          <div
            v-for="entry in paletteHistory"
            :key="entry.id"
            class="rounded-2xl border border-default px-4 py-4"
          >
            <div class="flex flex-wrap items-center gap-2">
              <UBadge color="neutral" variant="outline">
                v{{ entry.version }}
              </UBadge>
              <UBadge :color="entry.lifecycleStatus === 'published' ? 'success' : 'warning'" variant="soft">
                {{ entry.lifecycleStatus }}
              </UBadge>
              <UBadge color="neutral" variant="soft">
                {{ entry.event }}
              </UBadge>
            </div>

            <p class="mt-2 text-sm font-medium text-highlighted">
              {{ entry.name }}
            </p>
            <p class="mt-1 text-xs text-muted">
              {{ formatDate(entry.createdAt) }}
            </p>
          </div>
        </template>
      </div>
    </template>
  </UModal>

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
            show-history
            show-visibility-toggle
            show-delete
            @select="handlePaletteSelect(palette)"
            @history="handlePaletteHistoryOpen(palette)"
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
