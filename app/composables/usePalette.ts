import type { PaletteDefinition } from '~/types/palette'
import type {
  StoredPalette,
  UpdatePalettePayload as StoredPaletteUpdatePayload,
  UpdatePaletteVisibilityPayload
} from '~/types/palette-store'
import { emptyPalette, paletteOptions } from '~/utils/paletteRegistry'
import {
  clonePaletteDefinition,
  createEditablePalette,
  type EditablePalette,
  toEditablePalette,
  updateEditablePaletteToken,
  type UpdateEditablePaletteTokenPayload
} from '~/utils/palette-domain'

export function usePalette() {
  const currentPalette = useState<EditablePalette | null>('current-palette', () => {
    return createEditablePalette(emptyPalette)
  })
  const sourcePalette = useState<EditablePalette | null>('source-palette', () => {
    return createEditablePalette(emptyPalette)
  })

  const setCurrentPalette = (palette: PaletteDefinition | StoredPalette) => {
    currentPalette.value = createEditablePalette(palette)
    sourcePalette.value = createEditablePalette(palette)
  }

  const createEmptyPalette = () => {
    setCurrentPalette(emptyPalette)
  }

  const resetCurrentPalette = () => {
    if (!sourcePalette.value) {
      createEmptyPalette()
      return
    }

    currentPalette.value = createEditablePalette(sourcePalette.value)
  }

  const updatePaletteName = (name: string) => {
    if (!currentPalette.value) {
      return
    }

    currentPalette.value.name = name
  }

  const updatePalette = (payload: UpdateEditablePaletteTokenPayload) => {
    if (currentPalette.value) {
      updateEditablePaletteToken(currentPalette.value, payload)
    }
  }

  const savePalette = async () => {
    if (!currentPalette.value?._id) {
      return null
    }

    const editablePalette = clonePaletteDefinition(currentPalette.value)

    const payload: StoredPaletteUpdatePayload = {
      name: editablePalette.name,
      palette: editablePalette,
      isPublic: currentPalette.value.isPublic ?? false,
    }

    const updatedPalette = await $fetch<StoredPalette>(`/api/palettes/${currentPalette.value._id}`, {
      method: 'PUT',
      credentials: 'include',
      body: payload,
    })

    setCurrentPalette(updatedPalette)
    await refreshNuxtData('user-palettes')

    return updatedPalette
  }

  const saveNewPalette = async () => {
    if (!currentPalette.value) {
      return null
    }

    const editablePalette = clonePaletteDefinition(currentPalette.value)

    const payload = {
      name: editablePalette.name,
      palette: editablePalette,
      isPublic: false,
    }

    const createdPalette = await $fetch<StoredPalette>('/api/palettes', {
      method: 'POST',
      credentials: 'include',
      body: payload,
    })

    setCurrentPalette(createdPalette)
    await refreshNuxtData('user-palettes')

    return createdPalette
  }

  const deletePalette = async (id: string) => {
    await $fetch(`/api/palettes/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    if (currentPalette.value?._id === id) {
      createEmptyPalette()
    }

    await refreshNuxtData('user-palettes')
  }

  const updatePaletteVisibility = async (id: string, isPublic: boolean) => {
    const payload: UpdatePaletteVisibilityPayload = { isPublic }

    const updatedPalette = await $fetch<StoredPalette>(`/api/palettes/${id}/visibility`, {
      method: 'PATCH',
      credentials: 'include',
      body: payload,
    })

    if (currentPalette.value?._id === id) {
      setCurrentPalette(updatedPalette)
    }

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

  return {
    currentPalette,
    sourcePalette,
    createEmptyPalette,
    resetCurrentPalette,
    setCurrentPalette,
    updatePaletteName,
    updatePalette,
    savePalette,
    saveNewPalette,
    deletePalette,
    updatePaletteVisibility,
    defaultPalettes: paletteOptions.reduce<PaletteDefinition[]>((palettes, option) => {
      if (option.type === 'preset') {
        palettes.push(option.palette as PaletteDefinition)
      }

      return palettes
    }, []),
    getUserPalettes,
    getPublicPalettes
  }
}
