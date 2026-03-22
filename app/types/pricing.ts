export type PricingPlanId = 'pro'
export type BillingInterval = 'monthly' | 'yearly'

export interface PricingPlan {
  id: PricingPlanId
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  currency: string
  features: string[]
}
