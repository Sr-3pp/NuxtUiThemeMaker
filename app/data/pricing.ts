export type BillingInterval = 'monthly' | 'yearly'

export const FREE_PLAN_PALETTE_GENERATION_LIMIT = 3
export const PRO_PLAN_PALETTE_GENERATION_LIMIT = 30
export const STUDIO_PLAN_PALETTE_GENERATION_LIMIT = 100
export const FREE_PLAN_PALETTE_SAVE_LIMIT = 1
export const PRO_PLAN_PALETTE_SAVE_LIMIT = 20
export const STUDIO_PLAN_PALETTE_SAVE_LIMIT = null

function formatPaletteGenerationLimitFeature(limit: number) {
  return `${limit} AI palette generations per month`
}

function formatPaletteSaveLimitFeature(limit: number | null) {
  if (limit === null) {
    return 'Unlimited palette saves'
  }

  return `Save up to ${limit} ${limit === 1 ? 'palette' : 'palettes'}`
}

export const pricingPlans = [
  {
    id: 'free',
    name: 'Free',
    description: 'Try the theme creator with limited AI generations and basic features.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    currency: 'usd',
    paletteGenerationLimit: FREE_PLAN_PALETTE_GENERATION_LIMIT,
    paletteSaveLimit: FREE_PLAN_PALETTE_SAVE_LIMIT,
    features: [
      formatPaletteGenerationLimitFeature(FREE_PLAN_PALETTE_GENERATION_LIMIT),
      formatPaletteSaveLimitFeature(FREE_PLAN_PALETTE_SAVE_LIMIT),
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
    paletteGenerationLimit: PRO_PLAN_PALETTE_GENERATION_LIMIT,
    paletteSaveLimit: PRO_PLAN_PALETTE_SAVE_LIMIT,
    features: [
      formatPaletteGenerationLimitFeature(PRO_PLAN_PALETTE_GENERATION_LIMIT),
      formatPaletteSaveLimitFeature(PRO_PLAN_PALETTE_SAVE_LIMIT),
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
    paletteGenerationLimit: STUDIO_PLAN_PALETTE_GENERATION_LIMIT,
    paletteSaveLimit: STUDIO_PLAN_PALETTE_SAVE_LIMIT,
    features: [
      formatPaletteGenerationLimitFeature(STUDIO_PLAN_PALETTE_GENERATION_LIMIT),
      formatPaletteSaveLimitFeature(STUDIO_PLAN_PALETTE_SAVE_LIMIT),
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

export function getPaletteSaveLimit(planId: string | undefined) {
  return getPricingPlanById(planId as PricingPlanId)?.paletteSaveLimit ?? FREE_PLAN_PALETTE_SAVE_LIMIT
}

export function getPaletteGenerationLimit(planId: string | undefined) {
  return getPricingPlanById(planId as PricingPlanId)?.paletteGenerationLimit ?? FREE_PLAN_PALETTE_GENERATION_LIMIT
}

export function getDefaultPaidPricingPlanId(): PaidPricingPlan {
  if (!defaultPaidPricingPlanId) {
    throw new Error('At least one paid pricing plan must be configured')
  }

  return defaultPaidPricingPlanId
}
