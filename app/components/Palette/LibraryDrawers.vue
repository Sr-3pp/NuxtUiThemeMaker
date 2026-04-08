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
const { deletePalette, getPaletteHistory, getPublicPalettes, getUserPalettes, sharePalette, unsharePalette, updatePaletteVisibility } = usePaletteApi()
const { user } = useAuth()
const toast = useToast()
const { togglePalettesSidebar } = useSidebar()
const { showErrorToast } = useErrorToast()
const isHistoryOpen = ref(false)
const isHistoryLoading = ref(false)
const historyPalette = ref<StoredPalette | null>(null)
const paletteHistory = ref<PaletteVersionSnapshot[]>([])
const isShareOpen = ref(false)
const isSharing = ref(false)
const isUnsharing = ref(false)
const sharePaletteTarget = ref<StoredPalette | null>(null)
const shareEmail = ref('')

const { data: userPalettes, refresh: refreshUserPalettes } = await getUserPalettes()
const { data: publicPalettes } = await getPublicPalettes()

const ownedPalettes = computed(() => {
  return (userPalettes.value ?? []).filter(palette => palette.accessLevel === 'owner')
})

const sharedPalettes = computed(() => {
  return (userPalettes.value ?? []).filter(palette => palette.accessLevel === 'shared')
})

function syncSharePaletteTarget() {
  if (!sharePaletteTarget.value) {
    return
  }

  const nextPalette = (userPalettes.value ?? []).find(palette => palette._id === sharePaletteTarget.value?._id) ?? null
  sharePaletteTarget.value = nextPalette
}

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

function handlePaletteShareOpen(palette: StoredPalette) {
  sharePaletteTarget.value = palette
  shareEmail.value = ''
  isShareOpen.value = true
}

async function handlePaletteShareSubmit() {
  if (!sharePaletteTarget.value) {
    return
  }

  isSharing.value = true

  try {
    await sharePalette(sharePaletteTarget.value._id, {
      email: shareEmail.value,
    })
    await refreshUserPalettes()
    syncSharePaletteTarget()
    shareEmail.value = ''
    toast.add({
      title: 'Palette shared',
      description: 'Collaborator access was updated.',
      color: 'success',
    })
  } catch (error) {
    showErrorToast(error, 'Failed to share palette.')
  } finally {
    isSharing.value = false
  }
}

async function handlePaletteUnshare(collaboratorUserId: string) {
  if (!sharePaletteTarget.value) {
    return
  }

  isUnsharing.value = true

  try {
    await unsharePalette(sharePaletteTarget.value._id, collaboratorUserId)
    await refreshUserPalettes()
    syncSharePaletteTarget()
    toast.add({
      title: 'Access removed',
      description: 'Collaborator access was removed.',
      color: 'success',
    })
  } catch (error) {
    showErrorToast(error, 'Failed to remove collaborator.')
  } finally {
    isUnsharing.value = false
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
    v-model:open="isShareOpen"
    :title="sharePaletteTarget ? `Share ${sharePaletteTarget.name}` : 'Share palette'"
    description="Invite a registered user by email to access and edit this private palette."
  >
    <template #body>
      <div class="space-y-4">
        <UFormField label="Collaborator email" name="share-email">
          <UInput
            v-model="shareEmail"
            placeholder="designer@example.com"
            type="email"
          />
        </UFormField>

        <UButton
          block
          color="primary"
          icon="i-lucide-user-plus"
          :loading="isSharing"
          @click="handlePaletteShareSubmit"
        >
          Add collaborator
        </UButton>

        <div class="space-y-3">
          <p class="text-sm font-medium text-highlighted">
            Current collaborators
          </p>

          <div
            v-if="!sharePaletteTarget?.collaborators.length"
            class="rounded-2xl border border-default px-4 py-4 text-sm text-muted"
          >
            No collaborators yet.
          </div>

          <div
            v-for="collaborator in sharePaletteTarget?.collaborators ?? []"
            :key="collaborator.userId"
            class="flex items-center justify-between gap-3 rounded-2xl border border-default px-4 py-4"
          >
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-highlighted">
                {{ collaborator.name }}
              </p>
              <p class="truncate text-xs text-muted">
                {{ collaborator.email }}
              </p>
            </div>

            <UButton
              color="error"
              variant="soft"
              size="xs"
              icon="i-lucide-user-minus"
              :loading="isUnsharing"
              @click="handlePaletteUnshare(collaborator.userId)"
            >
              Remove
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </UModal>

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

        <div class="space-y-3" v-if="sharedPalettes.length">
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
