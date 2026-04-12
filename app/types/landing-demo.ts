import type { PaletteDefinition } from './palette'

export type LandingGenerationStatus = 'idle' | 'loading' | 'success' | 'error'
export type LandingPaletteLifecycle = 'temporary' | 'saved' | 'shared' | 'imported'
export type LandingPaletteSourceType = 'landing-ai' | 'shared' | 'imported'

export interface LandingGeneratedPaletteState {
  status: LandingGenerationStatus
  prompt: string
  errorMessage: string | null
  palette: PaletteDefinition | null
  generatedAt: string | null
  source: {
    type: LandingPaletteSourceType
    presetId: string | null
    sharedSlug: string | null
  }
  actions: {
    viewedFeatures: boolean
    viewedPricing: boolean
    clickedEdit: boolean
    clickedSave: boolean
    clickedExport: boolean
    clickedSignup: boolean
    regenerateCount: number
  }
  persistence: {
    lifecycle: LandingPaletteLifecycle
    paletteId: string | null
    slug: string | null
  }
}

export interface LandingPaletteSessionPayload {
  prompt: string
  generated: LandingGeneratedPaletteState
}
