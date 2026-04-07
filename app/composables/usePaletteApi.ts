import type { EditablePalette } from '~/types/palette-editor'
import type { StoredPalette, UpdatePalettePayload, UpdatePaletteVisibilityPayload } from '~/types/palette-store'
import type { PaletteGenerationAccess } from '~/types/palette-generation'
import { FREE_PLAN_PALETTE_GENERATION_LIMIT } from '../data/pricing'
import { clonePaletteDefinition } from '../utils/palette-domain'

export function usePaletteApi() {
  const savePalette = async (palette: EditablePalette) => {
    if (!palette._id) {
      return null
    }

    const editablePalette = clonePaletteDefinition(palette)

    const payload: UpdatePalettePayload = {
      name: editablePalette.name,
      palette: editablePalette,
      isPublic: palette.isPublic ?? false,
    }

    const updatedPalette = await $fetch<StoredPalette>(`/api/palettes/${palette._id}`, {
      method: 'PUT',
      credentials: 'include',
      body: payload,
    })

    await refreshNuxtData('user-palettes')

    return updatedPalette
  }

  const saveNewPalette = async (palette: EditablePalette) => {
    const editablePalette = clonePaletteDefinition(palette)

    const createdPalette = await $fetch<StoredPalette>('/api/palettes', {
      method: 'POST',
      credentials: 'include',
      body: {
        name: editablePalette.name,
        palette: editablePalette,
        isPublic: false,
      },
    })

    await refreshNuxtData('user-palettes')

    return createdPalette
  }

  const deletePalette = async (id: string) => {
    await $fetch(`/api/palettes/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    await refreshNuxtData('user-palettes')
  }

  const updatePaletteVisibility = async (id: string, isPublic: boolean) => {
    const payload: UpdatePaletteVisibilityPayload = { isPublic }

    const updatedPalette = await $fetch<StoredPalette>(`/api/palettes/${id}/visibility`, {
      method: 'PATCH',
      credentials: 'include',
      body: payload,
    })

    await refreshNuxtData('user-palettes')

    return updatedPalette
  }

  const getUserPalettes = () => useFetch<StoredPalette[]>('/api/palettes/user', {
    key: 'user-palettes',
    credentials: 'include',
    default: () => [],
  })

  const getPublicPalettes = () => useFetch<StoredPalette[]>('/api/palettes', {
    default: () => [],
  })

  const getPaletteGenerationAccess = () => useFetch<PaletteGenerationAccess>('/api/palettes/generation-access', {
    key: 'palette-generation-access',
    credentials: 'include',
    default: () => ({
      canGenerate: false,
      isPaidUnlimited: false,
      isAdminUnlimited: false,
      freeLimit: FREE_PLAN_PALETTE_GENERATION_LIMIT,
      freeUsed: 0,
      freeRemaining: FREE_PLAN_PALETTE_GENERATION_LIMIT,
      reason: 'unauthenticated',
    } satisfies PaletteGenerationAccess),
  })

  const generatePalette = async (prompt: string) => {
    const generatedPalette = await $fetch<EditablePalette>('/api/palettes/generate', {
      method: 'POST',
      credentials: 'include',
      body: { prompt },
    })

    await refreshNuxtData('palette-generation-access')

    return generatedPalette
  }

  return {
    deletePalette,
    getPaletteGenerationAccess,
    getPublicPalettes,
    getUserPalettes,
    saveNewPalette,
    savePalette,
    updatePaletteVisibility,
    generatePalette,
  }
}
