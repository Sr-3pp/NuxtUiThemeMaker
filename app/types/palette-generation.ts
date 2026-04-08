import type { PaletteColorScales, PaletteComponentThemes, PaletteDefinition, PaletteModeKey } from '~/types/palette'

export type PaletteGenerationAccessReason = 'unauthenticated' | 'free_limit_reached' | 'allowed'

export interface PaletteGenerationAccess {
  canGenerate: boolean
  isPaidUnlimited: boolean
  isAdminUnlimited: boolean
  freeLimit: number
  freeUsed: number
  freeRemaining: number
  reason: PaletteGenerationAccessReason
}

export interface PaletteGeneratePayload {
  prompt: string
  brandColors?: string[]
  referenceSummary?: string
}

export interface PaletteRampGeneratePayload {
  paletteName?: string
  brandColors: string[]
  prompt?: string
}

export interface PaletteRampGenerateResult {
  paletteName: string
  ramps: PaletteColorScales
}

export interface PaletteVariantGeneratePayload {
  prompt: string
  palette?: PaletteDefinition
  componentKeys?: string[]
}

export interface PaletteVariantGenerateResult {
  summary: string
  components: PaletteComponentThemes
}

export interface PaletteAuditGeneratePayload {
  palette: PaletteDefinition
  prompt?: string
}

export interface PaletteAuditFix {
  token: string
  mode: PaletteModeKey | 'shared'
  currentValue?: string | null
  suggestedValue: string
  reason: string
}

export interface PaletteAuditGenerateResult {
  summary: string
  fixes: PaletteAuditFix[]
  patchedPalette: PaletteDefinition
}

export interface PaletteDirectionsGeneratePayload {
  palette: PaletteDefinition
  prompt?: string
  count?: number
}

export interface PaletteDirectionResult {
  name: string
  rationale: string
  palette: PaletteDefinition
}

export interface PaletteDirectionsGenerateResult {
  directions: PaletteDirectionResult[]
}
