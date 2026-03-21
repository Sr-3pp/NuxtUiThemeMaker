import type { BillingInterval, PricingPlanId } from '~/types/pricing'

export interface StripeCheckoutRequest {
  planId: PricingPlanId
  billingInterval: BillingInterval
}

export interface StripeCheckoutResponse {
  id: string
  url: string | null
}
