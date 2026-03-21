import type { StoredPalette, UpdatePalettePayload, UpdatePaletteVisibilityPayload } from '~/types/palette-store'
import type { EditablePalette } from '~/utils/palette-domain'
import { clonePaletteDefinition } from '~/utils/palette-domain'

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

  const generatePalette = async (prompt: string) => {
    const generatedPalette = await $fetch<EditablePalette>('/api/palettes/generate', {
      method: 'POST',
      body: { prompt },
    })

    return generatedPalette
  }

  return {
    deletePalette,
    getPublicPalettes,
    getUserPalettes,
    saveNewPalette,
    savePalette,
    updatePaletteVisibility,
    generatePalette,
  }
}
