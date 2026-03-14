import type { PaletteDefinition, PaletteModeKey, PaletteTokenValue } from '~/types/palette'
import type { StoredPalette, UpdatePalettePayload as StoredPaletteUpdatePayload } from '~/types/palette-store'
import { paletteOptions } from '~/utils/paletteRegistry'

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
  const currentPalette = useState<EditablePalette | null>('current-palette', () => null)

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

  const setCurrentPalette = (palette: PaletteDefinition | StoredPalette) => {
    const editablePalette = toEditablePalette(palette)

    hydratePalette(editablePalette)
    currentPalette.value = editablePalette
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

    return createdPalette
  }

  const getUserPalettes = () => useFetch<StoredPalette[]>('/api/palettes/user', {
    credentials: 'include',
    default: () => [],
  })

  const getPublicPalettes = () => useFetch<StoredPalette[]>('/api/palettes', {
    default: () => [],
  })

  return {
    currentPalette,
    setCurrentPalette,
    updatePalette,
    savePalette,
    saveNewPalette,
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
