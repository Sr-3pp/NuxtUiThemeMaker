import type { BillingInterval, PaidPricingPlan } from '~/types/pricing'

export interface StripeCheckoutRequest {
  planId: PaidPricingPlan
  billingInterval: BillingInterval
}

export interface StripeCheckoutResponse {
  id: string
  url: string | null
}
