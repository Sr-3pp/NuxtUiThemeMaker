import type {
  LandingGeneratedPaletteState,
  LandingPaletteSessionPayload,
} from '~/types/landing-demo'
import { attachPaletteRuntimeUi } from '~/utils/palette-runtime-ui'

export const LANDING_DEMO_STORAGE_KEY = 'nuxt-ui-theme-builder:landing-demo'

export function createEmptyLandingGeneratedState(): LandingGeneratedPaletteState {
  return {
    status: 'idle',
    prompt: '',
    errorMessage: null,
    palette: null,
    generatedAt: null,
    source: {
      type: 'landing-ai',
      presetId: null,
      sharedSlug: null,
    },
    actions: {
      viewedFeatures: false,
      viewedPricing: false,
      clickedEdit: false,
      clickedSave: false,
      clickedExport: false,
      clickedSignup: false,
      regenerateCount: 0,
    },
    persistence: {
      lifecycle: 'temporary',
      paletteId: null,
      slug: null,
    },
  }
}

export function normalizeLandingGeneratedState(value: Partial<LandingGeneratedPaletteState>): LandingGeneratedPaletteState {
  const emptyState = createEmptyLandingGeneratedState()

  return {
    ...emptyState,
    ...value,
    palette: value.palette ? attachPaletteRuntimeUi(value.palette) : null,
    source: {
      ...emptyState.source,
      ...(value.source ?? {}),
    },
    actions: {
      ...emptyState.actions,
      ...(value.actions ?? {}),
    },
    persistence: {
      ...emptyState.persistence,
      ...(value.persistence ?? {}),
    },
  }
}

export function createLandingSessionPayload(input: {
  generated: LandingGeneratedPaletteState
  prompt: string
}): LandingPaletteSessionPayload {
  return {
    prompt: input.prompt,
    generated: input.generated,
  }
}
