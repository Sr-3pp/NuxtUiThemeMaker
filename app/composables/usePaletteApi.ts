import type { EditablePalette } from '~/types/palette-editor'
import type { CreatePaletteReviewPayload, PaletteReview, PaletteReviewThread } from '~/types/palette-review'
import type { SharePalettePayload, StoredPalette, UpdatePalettePayload, UpdatePaletteVisibilityPayload } from '~/types/palette-store'
import type {
  PaletteAuditGeneratePayload,
  PaletteAuditGenerateResult,
  PaletteDirectionsGeneratePayload,
  PaletteDirectionsGenerateResult,
  PaletteGeneratePayload,
  PaletteGenerateResult,
  PaletteGenerationAccess,
  PaletteRampGeneratePayload,
  PaletteRampGenerateResult,
} from '~/types/palette-generation'
import type { PaletteVersionSnapshot } from '~/types/palette-version'
import { FREE_PLAN_PALETTE_GENERATION_LIMIT } from '../data/pricing'
import { clonePaletteDefinition } from '../utils/palette-domain'

export function usePaletteApi() {
  function refreshNuxtDataInBackground(key: string) {
    Promise.resolve(refreshNuxtData(key)).catch((error) => {
      console.error(`Failed to refresh Nuxt data for "${key}"`, error)
    })
  }

  async function fetchWithRefresh<T>(
    input: string,
    init: Parameters<typeof $fetch<T>>[1],
    refreshKey: string,
    options?: {
      awaitRefresh?: boolean
    },
  ) {
    const result = await $fetch<T>(input, init)

    if (options?.awaitRefresh === false) {
      refreshNuxtDataInBackground(refreshKey)
      return result
    }

    await refreshNuxtData(refreshKey)

    return result
  }

  function fetchWithUserPaletteRefresh<T>(
    input: string,
    init: Parameters<typeof $fetch<T>>[1],
  ) {
    return fetchWithRefresh<T>(input, init, 'user-palettes')
  }

  function fetchWithGenerationAccessRefresh<T>(
    input: string,
    init: Parameters<typeof $fetch<T>>[1],
  ) {
    return fetchWithRefresh<T>(input, init, 'palette-generation-access', {
      awaitRefresh: false,
    })
  }

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

    return fetchWithUserPaletteRefresh<StoredPalette>(`/api/palettes/${palette._id}`, {
      method: 'PUT',
      credentials: 'include',
      body: payload,
    })
  }

  const saveNewPalette = async (palette: EditablePalette) => {
    const editablePalette = clonePaletteDefinition(palette)

    return fetchWithUserPaletteRefresh<StoredPalette>('/api/palettes', {
      method: 'POST',
      credentials: 'include',
      body: {
        name: editablePalette.name,
        palette: editablePalette,
        isPublic: false,
      },
    })
  }

  const deletePalette = async (id: string) => {
    await fetchWithUserPaletteRefresh(`/api/palettes/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
  }

  const forkPalette = async (id: string) => {
    return fetchWithUserPaletteRefresh<StoredPalette>(`/api/palettes/${id}/fork`, {
      method: 'POST',
      credentials: 'include',
    })
  }

  const sharePalette = async (id: string, payload: SharePalettePayload) => {
    return fetchWithUserPaletteRefresh<StoredPalette>(`/api/palettes/${id}/share`, {
      method: 'POST',
      credentials: 'include',
      body: payload,
    })
  }

  const unsharePalette = async (id: string, collaboratorUserId: string) => {
    return fetchWithUserPaletteRefresh<StoredPalette>(`/api/palettes/${id}/share/${collaboratorUserId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
  }

  const updatePaletteVisibility = async (id: string, isPublic: boolean) => {
    const payload: UpdatePaletteVisibilityPayload = { isPublic }

    return fetchWithUserPaletteRefresh<StoredPalette>(`/api/palettes/${id}/visibility`, {
      method: 'PATCH',
      credentials: 'include',
      body: payload,
    })
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
    return fetchWithGenerationAccessRefresh<PaletteGenerateResult>('/api/palettes/generate', {
      method: 'POST',
      credentials: 'include',
      body: typeof payload === 'string' ? { prompt: payload } : payload,
    })
  }

  const generatePaletteRamps = async (payload: PaletteRampGeneratePayload) => {
    return fetchWithGenerationAccessRefresh<PaletteRampGenerateResult>('/api/palettes/generate/ramp', {
      method: 'POST',
      credentials: 'include',
      body: payload,
    })
  }

  const generatePaletteAudit = async (payload: PaletteAuditGeneratePayload) => {
    return fetchWithGenerationAccessRefresh<PaletteAuditGenerateResult>('/api/palettes/generate/audit', {
      method: 'POST',
      credentials: 'include',
      body: payload,
    })
  }

  const generatePaletteDirections = async (payload: PaletteDirectionsGeneratePayload) => {
    return fetchWithGenerationAccessRefresh<PaletteDirectionsGenerateResult>('/api/palettes/generate/directions', {
      method: 'POST',
      credentials: 'include',
      body: payload,
    })
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
    generatePaletteAudit,
    generatePaletteDirections,
  }
}
