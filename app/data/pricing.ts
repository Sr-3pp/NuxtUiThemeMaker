import type { PricingPlan } from '~/types/pricing'

export const pricingPlans: PricingPlan[] = [
  {
    id: 'pro',
    name: 'Pro',
    description: 'For solo creators who want unlimited AI palette generation.',
    monthlyPrice: 19,
    yearlyPrice: 190,
    currency: 'usd',
    features: [
      'Unlimited AI palette generations',
      'Keep your full saved palette workflow',
      'Monthly or yearly billing support later',
    ],
  },
]
