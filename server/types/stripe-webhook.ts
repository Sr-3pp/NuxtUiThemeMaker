import type { BillingInterval } from '~/types/pricing'

export interface StripeEvent {
  type: string
  data?: {
    object?: Record<string, unknown>
  }
}

export type UserPlan = 'free' | 'pro' | 'team'
export type UserPlanStatus = 'inactive' | 'trialing' | 'active' | 'past_due' | 'canceled'
export type PaidUserPlan = Exclude<UserPlan, 'free'>
export type NullableBillingInterval = BillingInterval | null
