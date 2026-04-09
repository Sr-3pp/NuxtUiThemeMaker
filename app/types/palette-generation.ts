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
  referenceImage?: {
    data: string
    mimeType: string
  }
}

export interface PaletteReferenceImageAsset {
  data: string
  mimeType: string
  name: string
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

export interface PaletteAiResultHistoryEntry<T> {
  id: number
  label: string
  createdAt: string
  detail?: string
  result: T
}

export interface PaletteAiPersistedHistoryState<T> {
  items: PaletteAiResultHistoryEntry<T>[]
  selectedId: number | null
}

export interface PaletteAiPersistedSession {
  starter: PaletteAiPersistedHistoryState<PaletteDefinition>
  audit: PaletteAiPersistedHistoryState<PaletteAuditGenerateResult>
  directions: PaletteAiPersistedHistoryState<PaletteDirectionsGenerateResult>
  ramps: PaletteAiPersistedHistoryState<PaletteRampGenerateResult>
  variants: PaletteAiPersistedHistoryState<PaletteVariantGenerateResult>
}
