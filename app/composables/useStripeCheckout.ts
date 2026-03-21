import type { BillingInterval, PricingPlan } from '~/types/pricing'
import type { StripeCheckoutRequest, StripeCheckoutResponse } from '~/types/stripe'

export function useStripeCheckout() {
  async function createCheckoutSession(planId: PricingPlan['id'], billingInterval: BillingInterval) {
    return $fetch<StripeCheckoutResponse>('/api/stripe/checkout', {
      method: 'POST',
      credentials: 'include',
      body: {
        planId,
        billingInterval,
      } satisfies StripeCheckoutRequest,
    })
  }

  return {
    createCheckoutSession,
  }
}
