import type { BillingInterval, PricingPlanId } from '~/types/pricing'

export interface BillingStatus {
  hasActivePlan: boolean
  isAdminUnlimited: boolean
  plan: PricingPlanId | 'free'
  planInterval: BillingInterval | null
  planStatus: 'inactive' | 'trialing' | 'active' | 'past_due' | 'canceled'
}
