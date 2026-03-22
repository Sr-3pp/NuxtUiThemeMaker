export type BillingInterval = 'monthly' | 'yearly'

export const pricingPlans = [
  {
    id: 'free',
    name: 'Free',
    description: 'Try the theme creator with limited AI generations and basic features.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    currency: 'usd',
    features: [
      '3 AI palette generations per month',
      'Save up to 1 palette',
      'Export theme JSON',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For creators who need more flexibility and frequent palette generation.',
    monthlyPrice: 15,
    yearlyPrice: 150,
    currency: 'usd',
    features: [
      '30 AI palette generations per month',
      'Save up to 20 palettes',
      'Priority generation access',
      'Advanced export options',
    ],
  },
  {
    id: 'studio',
    name: 'Studio',
    description: 'For heavy workflows and power users who need higher limits and faster access.',
    monthlyPrice: 29,
    yearlyPrice: 290,
    currency: 'usd',
    features: [
      '100 AI palette generations per month',
      'Unlimited palette saves',
      'Faster generation during peak usage',
      'Early access to new features',
    ],
  },
] as const

export type PricingPlan = (typeof pricingPlans)[number]
export type PricingPlanId = PricingPlan['id']
export type PaidPricingPlan = Exclude<PricingPlanId, 'free'>

export const pricingPlanIds = pricingPlans.map(plan => plan.id)
export const paidPricingPlans = pricingPlans.filter((plan): plan is Extract<PricingPlan, { id: PaidPricingPlan }> => plan.id !== 'free')
export const paidPricingPlanIds = paidPricingPlans.map(plan => plan.id)
export const defaultPaidPricingPlanId = paidPricingPlanIds[0] ?? null

export function isPricingPlanId(value: unknown): value is PricingPlanId {
  return pricingPlanIds.includes(value as PricingPlanId)
}

export function isPaidPricingPlanId(value: unknown): value is PaidPricingPlan {
  return paidPricingPlanIds.includes(value as PaidPricingPlan)
}

export function getPricingPlanById(planId: PricingPlanId) {
  return pricingPlans.find(plan => plan.id === planId) ?? null
}

export function getDefaultPaidPricingPlanId(): PaidPricingPlan {
  if (!defaultPaidPricingPlanId) {
    throw new Error('At least one paid pricing plan must be configured')
  }

  return defaultPaidPricingPlanId
}
