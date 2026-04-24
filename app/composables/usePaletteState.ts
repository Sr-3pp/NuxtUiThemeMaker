import type {
  EditablePalette,
  UpdateEditablePaletteColorScalePayload,
  UpdateEditablePaletteComponentTokenPayload,
  UpdateEditablePaletteTokenPayload,
} from '~/types/palette-editor'
import type { PaletteColorScales, PaletteComponentThemes, PaletteDefinition, PaletteUiConfig } from '~/types/palette'
import type { StoredPalette } from '~/types/palette-store'
import { emptyPalette } from '~/utils/paletteRegistry'
import {
  clonePaletteDefinition,
  createEditablePalette,
  createPaletteWithGeneratedComponents,
  createPaletteWithGeneratedRamps,
  updateEditablePaletteColorScale,
  updateEditablePaletteComponentToken,
  updateEditablePaletteToken,
} from '~/utils/palette-domain'
import { attachPaletteRuntimeUi } from '../utils/palette-runtime-ui'

export function usePaletteState() {
  const currentPalette = useState<EditablePalette | null>('current-palette', () => {
    return createEditablePalette(emptyPalette)
  })
  const sourcePalette = useState<EditablePalette | null>('source-palette', () => {
    return createEditablePalette(emptyPalette)
  })

  const setCurrentPalette = (palette: PaletteDefinition | StoredPalette, ui?: PaletteUiConfig | null) => {
    const resolvedPalette = attachPaletteRuntimeUi(
      'palette' in palette ? palette.palette : palette,
      ui,
    )

    if ('palette' in palette) {
      const storedPalette = {
        ...palette,
        palette: resolvedPalette,
      }

      currentPalette.value = createEditablePalette(storedPalette)
      sourcePalette.value = createEditablePalette(storedPalette)
      return
    }

    currentPalette.value = createEditablePalette(resolvedPalette)
    sourcePalette.value = createEditablePalette(resolvedPalette)
  }

  const applyGeneratedPalette = (palette: PaletteDefinition, ui?: PaletteUiConfig | null) => {
    const resolvedPalette = attachPaletteRuntimeUi(palette, ui)
    const nextPalette = createEditablePalette(resolvedPalette)
    const previousPalette = currentPalette.value ?? sourcePalette.value

    if (!previousPalette) {
      currentPalette.value = nextPalette
      sourcePalette.value = createEditablePalette(resolvedPalette)
      return
    }

    const preservedPalette = {
      ...nextPalette,
      _id: previousPalette._id,
      userId: previousPalette.userId,
      slug: previousPalette.slug,
      isPublic: previousPalette.isPublic,
      lifecycleStatus: previousPalette.lifecycleStatus,
      version: previousPalette.version,
      publishedAt: previousPalette.publishedAt,
      forkedFrom: previousPalette.forkedFrom,
      collaborators: previousPalette.collaborators,
      accessLevel: previousPalette.accessLevel,
      createdAt: previousPalette.createdAt,
      updatedAt: previousPalette.updatedAt,
    }

    currentPalette.value = preservedPalette
    sourcePalette.value = {
      ...createEditablePalette(clonePaletteDefinition(preservedPalette)),
      _id: preservedPalette._id,
      userId: preservedPalette.userId,
      slug: preservedPalette.slug,
      isPublic: preservedPalette.isPublic,
      lifecycleStatus: preservedPalette.lifecycleStatus,
      version: preservedPalette.version,
      publishedAt: preservedPalette.publishedAt,
      forkedFrom: preservedPalette.forkedFrom,
      collaborators: preservedPalette.collaborators,
      accessLevel: preservedPalette.accessLevel,
      createdAt: preservedPalette.createdAt,
      updatedAt: preservedPalette.updatedAt,
    }
  }

  const applyGeneratedRamps = (ramps: PaletteColorScales) => {
    if (!currentPalette.value) {
      return
    }

    currentPalette.value = createEditablePalette(
      createPaletteWithGeneratedRamps(currentPalette.value, ramps)
    )
  }

  const applyGeneratedComponents = (components: PaletteComponentThemes) => {
    if (!currentPalette.value) {
      return
    }

    currentPalette.value = createEditablePalette(
      createPaletteWithGeneratedComponents(currentPalette.value, components)
    )
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
      lifecycleStatus: sourcePalette.value.lifecycleStatus,
      version: sourcePalette.value.version,
      publishedAt: sourcePalette.value.publishedAt,
      forkedFrom: sourcePalette.value.forkedFrom,
      collaborators: sourcePalette.value.collaborators,
      accessLevel: sourcePalette.value.accessLevel,
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
    applyGeneratedPalette,
    applyGeneratedRamps,
    applyGeneratedComponents,
    updatePaletteName,
    updatePalette,
    updatePaletteColorScale,
    updatePaletteComponentToken,
  }
}
