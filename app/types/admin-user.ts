import type { BillingInterval, PricingPlanId } from '~/types/pricing'

export interface AdminUserListItem {
  id: string
  name: string
  email: string
  emailVerified: boolean
  isAdmin: boolean
  plan: PricingPlanId | 'free'
  planStatus: 'inactive' | 'trialing' | 'active' | 'past_due' | 'canceled'
  planInterval: BillingInterval | null
  planExpiresAt: string | null
  aiPaletteGenerationsUsed: number
  createdAt: string
  updatedAt: string
}

export interface AdminUserUpdateInput {
  name: string
  email: string
  isAdmin: boolean
  newPassword?: string
}
