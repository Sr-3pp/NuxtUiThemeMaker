import type { PaletteDefinition, PaletteModeKey, PaletteTokenValue } from '~/types/palette'
import type {
  StoredPalette,
  UpdatePalettePayload as StoredPaletteUpdatePayload,
  UpdatePaletteVisibilityPayload
} from '~/types/palette-store'
import { emptyPalette, paletteOptions } from '~/utils/paletteRegistry'

type EditablePalette = PaletteDefinition & Partial<Omit<StoredPalette, 'name' | 'palette'>>

const clonePaletteDefinition = (palette: PaletteDefinition): PaletteDefinition => {
  const cloneMode = (mode: PaletteDefinition['modes']['light']) => {
    return Object.fromEntries(
      Object.entries(mode).map(([section, tokens]) => [section, { ...tokens }])
    )
  }

  return {
    name: palette.name,
    modes: {
      light: cloneMode(palette.modes.light),
      dark: cloneMode(palette.modes.dark),
    },
  }
}

interface UpdatePalettePayload {
  mode: PaletteModeKey
  section: string
  token: string
  value: PaletteTokenValue
}

export function usePalette() {
  const toEditablePalette = (palette: PaletteDefinition | StoredPalette): EditablePalette => {
    if ('_id' in palette) {
      const clonedPalette = clonePaletteDefinition({
        name: palette.name,
        modes: palette.palette.modes,
      })

      return {
        name: clonedPalette.name,
        modes: clonedPalette.modes,
        _id: palette._id,
        userId: palette.userId,
        slug: palette.slug,
        isPublic: palette.isPublic,
        createdAt: palette.createdAt,
        updatedAt: palette.updatedAt,
      }
    }

    const clonedPalette = clonePaletteDefinition(palette)

    return {
      name: clonedPalette.name,
      modes: clonedPalette.modes,
    }
  }

  const hydratePalette = (palette: PaletteDefinition) => {
    ;(['light', 'dark'] as const).forEach((modeKey) => {
      const mode = palette.modes[modeKey]

      if (!mode.color) {
          mode.color = {
            primary: mode.ui?.primary ?? null,
            secondary: mode.ui?.secondary ?? null,
            neutral: mode.ui?.neutral ?? null,
            success: mode.ui?.success ?? null,
            info: mode.ui?.info ?? null,
            warning: mode.ui?.warning ?? null,
            error: mode.ui?.error ?? null,
          }
      }

    })
  }

  const currentPalette = useState<EditablePalette | null>('current-palette', () => {
    const editablePalette = toEditablePalette(emptyPalette)

    hydratePalette(editablePalette)

    return editablePalette
  })
  const sourcePalette = useState<EditablePalette | null>('source-palette', () => {
    const editablePalette = toEditablePalette(emptyPalette)

    hydratePalette(editablePalette)

    return editablePalette
  })

  const setCurrentPalette = (palette: PaletteDefinition | StoredPalette) => {
    const editablePalette = toEditablePalette(palette)
    const editableSourcePalette = toEditablePalette(palette)

    hydratePalette(editablePalette)
    hydratePalette(editableSourcePalette)
    currentPalette.value = editablePalette
    sourcePalette.value = editableSourcePalette
  }

  const createEmptyPalette = () => {
    setCurrentPalette(emptyPalette)
  }

  const resetCurrentPalette = () => {
    if (!sourcePalette.value) {
      createEmptyPalette()
      return
    }

    const editablePalette = toEditablePalette(sourcePalette.value)
    hydratePalette(editablePalette)
    currentPalette.value = editablePalette
  }

  const updatePaletteName = (name: string) => {
    if (!currentPalette.value) {
      return
    }

    currentPalette.value.name = name
  }

  const updatePalette = ({ mode, section, token, value }: UpdatePalettePayload) => {
    if (currentPalette.value) {
      const paletteMode = currentPalette.value.modes[mode]
      const paletteSection = paletteMode[section]

      if (!paletteSection) {
        return
      }

      paletteSection[token] = value

      if (section === 'color') {
        const semanticSection = paletteMode.ui

        if (!semanticSection) {
          return
        }

        semanticSection[token] = value
      }
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
