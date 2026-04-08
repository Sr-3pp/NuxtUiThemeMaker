import type { EditablePalette } from '~/types/palette-editor'
import type { CreatePaletteReviewPayload, PaletteReview, PaletteReviewThread } from '~/types/palette-review'
import type { SharePalettePayload, StoredPalette, UpdatePalettePayload, UpdatePaletteVisibilityPayload } from '~/types/palette-store'
import type {
  PaletteAuditGeneratePayload,
  PaletteAuditGenerateResult,
  PaletteDirectionsGeneratePayload,
  PaletteDirectionsGenerateResult,
  PaletteGeneratePayload,
  PaletteGenerationAccess,
  PaletteRampGeneratePayload,
  PaletteRampGenerateResult,
  PaletteVariantGeneratePayload,
  PaletteVariantGenerateResult,
} from '~/types/palette-generation'
import type { PaletteVersionSnapshot } from '~/types/palette-version'
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

  const forkPalette = async (id: string) => {
    const forkedPalette = await $fetch<StoredPalette>(`/api/palettes/${id}/fork`, {
      method: 'POST',
      credentials: 'include',
    })

    await refreshNuxtData('user-palettes')

    return forkedPalette
  }

  const sharePalette = async (id: string, payload: SharePalettePayload) => {
    const updatedPalette = await $fetch<StoredPalette>(`/api/palettes/${id}/share`, {
      method: 'POST',
      credentials: 'include',
      body: payload,
    })

    await refreshNuxtData('user-palettes')

    return updatedPalette
  }

  const unsharePalette = async (id: string, collaboratorUserId: string) => {
    const updatedPalette = await $fetch<StoredPalette>(`/api/palettes/${id}/share/${collaboratorUserId}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    await refreshNuxtData('user-palettes')

    return updatedPalette
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

  const getPaletteHistory = async (id: string) => {
    return $fetch<PaletteVersionSnapshot[]>(`/api/palettes/${id}/history`, {
      credentials: 'include',
    })
  }

  const getPaletteReviews = async (id: string) => {
    return $fetch<PaletteReviewThread>(`/api/palettes/${id}/reviews`, {
      credentials: 'include',
    })
  }

  const createPaletteReview = async (id: string, payload: CreatePaletteReviewPayload) => {
    return $fetch<PaletteReview>(`/api/palettes/${id}/reviews`, {
      method: 'POST',
      credentials: 'include',
      body: payload,
    })
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

  const generatePalette = async (payload: string | PaletteGeneratePayload) => {
    const generatedPalette = await $fetch<EditablePalette>('/api/palettes/generate', {
      method: 'POST',
      credentials: 'include',
      body: typeof payload === 'string' ? { prompt: payload } : payload,
    })

    await refreshNuxtData('palette-generation-access')

    return generatedPalette
  }

  const generatePaletteRamps = async (payload: PaletteRampGeneratePayload) => {
    const result = await $fetch<PaletteRampGenerateResult>('/api/palettes/generate/ramp', {
      method: 'POST',
      credentials: 'include',
      body: payload,
    })

    await refreshNuxtData('palette-generation-access')

    return result
  }

  const generatePaletteVariants = async (payload: PaletteVariantGeneratePayload) => {
    const result = await $fetch<PaletteVariantGenerateResult>('/api/palettes/generate/variants', {
      method: 'POST',
      credentials: 'include',
      body: payload,
    })

    await refreshNuxtData('palette-generation-access')

    return result
  }

  const generatePaletteAudit = async (payload: PaletteAuditGeneratePayload) => {
    const result = await $fetch<PaletteAuditGenerateResult>('/api/palettes/generate/audit', {
      method: 'POST',
      credentials: 'include',
      body: payload,
    })

    await refreshNuxtData('palette-generation-access')

    return result
  }

  const generatePaletteDirections = async (payload: PaletteDirectionsGeneratePayload) => {
    const result = await $fetch<PaletteDirectionsGenerateResult>('/api/palettes/generate/directions', {
      method: 'POST',
      credentials: 'include',
      body: payload,
    })

    await refreshNuxtData('palette-generation-access')

    return result
  }

  return {
    deletePalette,
    forkPalette,
    getPaletteGenerationAccess,
    getPaletteHistory,
    getPaletteReviews,
    getPublicPalettes,
    getUserPalettes,
    createPaletteReview,
    sharePalette,
    saveNewPalette,
    savePalette,
    unsharePalette,
    updatePaletteVisibility,
    generatePalette,
    generatePaletteRamps,
    generatePaletteVariants,
    generatePaletteAudit,
    generatePaletteDirections,
  }
}
