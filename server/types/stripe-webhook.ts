import type { BillingInterval, PricingPlanId } from '~/types/pricing'

export interface StripeEvent {
  type: string
  data?: {
    object?: Record<string, unknown>
  }
}

export type UserPlan = PricingPlanId
export type UserPlanStatus = 'inactive' | 'trialing' | 'active' | 'past_due' | 'canceled'
export type PaidUserPlan = Exclude<PricingPlanId, 'free'>
export type NullableBillingInterval = BillingInterval | null
