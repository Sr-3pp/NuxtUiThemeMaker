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
