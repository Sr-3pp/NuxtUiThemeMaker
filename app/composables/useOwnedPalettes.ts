import type { MaybeRefOrGetter, Ref } from 'vue'
import type { PaletteDefinition } from '~/types/palette'
import type {
  SavePalettePayload,
  StoredPalette,
  UpdatePaletteVisibilityPayload,
} from '~/types/palette-store'

interface UseOwnedPalettesOptions {
  currentEditablePalette: Ref<PaletteDefinition>
  currentPalette: Ref<PaletteDefinition | null>
  currentPaletteId: Ref<string>
  isAuthenticated: MaybeRefOrGetter<boolean>
  onApplyPaletteSource: (id: string, palette: PaletteDefinition) => void
  onRemovePaletteSource: (id: string) => void
  onSelectPalette: (id: string) => void
}

interface PaletteActionResult {
  error?: string
  message?: string
}

function savedPaletteSourceId(id: string) {
  return `saved:${id}`
}

export function useOwnedPalettes(options: UseOwnedPalettesOptions) {
  const route = useRoute()
  const ownedPalettes = ref<StoredPalette[]>([])
  const activeOwnedPaletteId = ref<string | null>(null)
  const isWorking = ref(false)

  const activeOwnedPalette = computed(() =>
    ownedPalettes.value.find(palette => palette._id === activeOwnedPaletteId.value) ?? null
  )

  function syncPaletteSources(palettes: StoredPalette[]) {
    const nextSourceIds = new Set<string>()

    for (const palette of palettes) {
      const sourceId = savedPaletteSourceId(palette._id)
      nextSourceIds.add(sourceId)
      options.onApplyPaletteSource(sourceId, palette.palette)
    }

    for (const palette of ownedPalettes.value) {
      const sourceId = savedPaletteSourceId(palette._id)

      if (!nextSourceIds.has(sourceId)) {
        options.onRemovePaletteSource(sourceId)
      }
    }
  }

  async function refreshOwnedPalettes() {
    if (!toValue(options.isAuthenticated)) {
      clearOwnedPalettes()
      return
    }

    const palettes = await $fetch<StoredPalette[]>('/api/palettes')

    syncPaletteSources(palettes)
    ownedPalettes.value = palettes

    if (activeOwnedPaletteId.value && !palettes.some(palette => palette._id === activeOwnedPaletteId.value)) {
      activeOwnedPaletteId.value = null
    }
  }

  function clearOwnedPalettes() {
    for (const palette of ownedPalettes.value) {
      options.onRemovePaletteSource(savedPaletteSourceId(palette._id))
    }

    ownedPalettes.value = []
    activeOwnedPaletteId.value = null
  }

  function selectOwnedPalette(id: string) {
    const palette = ownedPalettes.value.find(item => item._id === id)

    if (!palette) {
      return
    }

    activeOwnedPaletteId.value = id
    options.onApplyPaletteSource(savedPaletteSourceId(palette._id), palette.palette)
    options.onSelectPalette(savedPaletteSourceId(palette._id))
  }

  function ensureSavablePalette() {
    if (!toValue(options.isAuthenticated)) {
      navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
      return { error: 'Sign in to save palettes.' } satisfies PaletteActionResult
    }

    if (!options.currentPalette.value) {
      return { error: 'Create a custom palette before saving.' } satisfies PaletteActionResult
    }

    const name = options.currentEditablePalette.value.name.trim()

    if (!name) {
      return { error: 'Palette name is required.' } satisfies PaletteActionResult
    }

    return {
      name,
      payload: {
        name,
        palette: options.currentEditablePalette.value,
        isPublic: activeOwnedPalette.value?.isPublic ?? false,
      } satisfies SavePalettePayload,
    }
  }

  function upsertOwnedPalette(palette: StoredPalette) {
    const nextPalettes = ownedPalettes.value.filter(item => item._id !== palette._id)

    nextPalettes.unshift(palette)
    ownedPalettes.value = nextPalettes
    activeOwnedPaletteId.value = palette._id
    options.onApplyPaletteSource(savedPaletteSourceId(palette._id), palette.palette)
    options.onSelectPalette(savedPaletteSourceId(palette._id))
  }

  async function savePalette(asNew = false): Promise<PaletteActionResult> {
    const candidate = ensureSavablePalette()

    if ('error' in candidate) {
      return candidate
    }

    isWorking.value = true

    try {
      const shouldCreate = asNew || !activeOwnedPaletteId.value
      const palette = shouldCreate
        ? await $fetch<StoredPalette>('/api/palettes', {
            method: 'POST',
            body: candidate.payload,
          })
        : await $fetch<StoredPalette>(`/api/palettes/${activeOwnedPaletteId.value}`, {
            method: 'PUT',
            body: candidate.payload,
          })

      upsertOwnedPalette(palette)

      return {
        message: shouldCreate ? 'Palette saved.' : 'Palette updated.',
      }
    }
    catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to save palette.',
      }
    }
    finally {
      isWorking.value = false
    }
  }

  async function updateVisibility(isPublic: boolean): Promise<PaletteActionResult> {
    if (!activeOwnedPaletteId.value) {
      return { error: 'Select a saved palette first.' }
    }

    isWorking.value = true

    try {
      const palette = await $fetch<StoredPalette>(`/api/palettes/${activeOwnedPaletteId.value}/visibility`, {
        method: 'PATCH',
        body: { isPublic } satisfies UpdatePaletteVisibilityPayload,
      })

      upsertOwnedPalette(palette)

      return {
        message: palette.isPublic ? 'Palette is now public.' : 'Palette is now private.',
      }
    }
    catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to update visibility.',
      }
    }
    finally {
      isWorking.value = false
    }
  }

  async function deletePalette(): Promise<PaletteActionResult> {
    if (!activeOwnedPaletteId.value) {
      return { error: 'Select a saved palette first.' }
    }

    const paletteId = activeOwnedPaletteId.value
    isWorking.value = true

    try {
      await $fetch(`/api/palettes/${paletteId}`, {
        method: 'DELETE',
      })

      ownedPalettes.value = ownedPalettes.value.filter(palette => palette._id !== paletteId)
      options.onRemovePaletteSource(savedPaletteSourceId(paletteId))
      activeOwnedPaletteId.value = null

      if (options.currentPaletteId.value === savedPaletteSourceId(paletteId)) {
        options.onSelectPalette('default')
      }

      return {
        message: 'Palette deleted.',
      }
    }
    catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to delete palette.',
      }
    }
    finally {
      isWorking.value = false
    }
  }

  async function copyShareUrl(): Promise<PaletteActionResult> {
    if (!activeOwnedPalette.value?.isPublic) {
      return { error: 'Make the palette public before sharing it.' }
    }

    if (!import.meta.client || !navigator.clipboard) {
      return { error: 'Clipboard is not available in this browser.' }
    }

    const shareUrl = `${window.location.origin}/palette/${activeOwnedPalette.value.slug}`
    await navigator.clipboard.writeText(shareUrl)

    return {
      message: 'Share URL copied.',
    }
  }

  return {
    activeOwnedPalette,
    activeOwnedPaletteId,
    clearOwnedPalettes,
    copyShareUrl,
    deletePalette,
    isWorking,
    ownedPalettes,
    refreshOwnedPalettes,
    savePalette,
    selectOwnedPalette,
    updateVisibility,
  }
}
