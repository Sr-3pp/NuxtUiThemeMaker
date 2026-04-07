import type {
  EditablePalette,
  UpdateEditablePaletteColorScalePayload,
  UpdateEditablePaletteComponentTokenPayload,
  UpdateEditablePaletteTokenPayload,
} from '~/types/palette-editor'
import type { PaletteDefinition } from '~/types/palette'
import type { StoredPalette } from '~/types/palette-store'
import { emptyPalette } from '~/utils/paletteRegistry'
import {
  clonePaletteDefinition,
  createEditablePalette,
  updateEditablePaletteColorScale,
  updateEditablePaletteComponentToken,
  updateEditablePaletteToken,
} from '~/utils/palette-domain'

export function usePaletteState() {
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

    currentPalette.value = {
      ...createEditablePalette(clonePaletteDefinition(sourcePalette.value)),
      _id: sourcePalette.value._id,
      userId: sourcePalette.value.userId,
      slug: sourcePalette.value.slug,
      isPublic: sourcePalette.value.isPublic,
      createdAt: sourcePalette.value.createdAt,
      updatedAt: sourcePalette.value.updatedAt,
    }
  }

  const updatePaletteName = (name: string) => {
    if (!currentPalette.value) {
      return
    }

    currentPalette.value.name = name
  }

  const updatePalette = (payload: UpdateEditablePaletteTokenPayload) => {
    if (!currentPalette.value) {
      return
    }

    updateEditablePaletteToken(currentPalette.value, payload)
  }

  const updatePaletteColorScale = (payload: UpdateEditablePaletteColorScalePayload) => {
    if (!currentPalette.value) {
      return
    }

    updateEditablePaletteColorScale(currentPalette.value, payload)
  }

  const updatePaletteComponentToken = (payload: UpdateEditablePaletteComponentTokenPayload) => {
    if (!currentPalette.value) {
      return
    }

    updateEditablePaletteComponentToken(currentPalette.value, payload)
  }

  return {
    currentPalette,
    sourcePalette,
    createEmptyPalette,
    resetCurrentPalette,
    setCurrentPalette,
    updatePaletteName,
    updatePalette,
    updatePaletteColorScale,
    updatePaletteComponentToken,
  }
}
