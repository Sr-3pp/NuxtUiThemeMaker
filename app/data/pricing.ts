export type BillingInterval = 'monthly' | 'yearly'

export const FREE_PLAN_PALETTE_GENERATION_LIMIT = 5
export const PRO_PLAN_PALETTE_GENERATION_LIMIT = 60
export const TEAMS_PLAN_PALETTE_GENERATION_LIMIT = 300
export const FREE_PLAN_PALETTE_SAVE_LIMIT = 1
export const PRO_PLAN_PALETTE_SAVE_LIMIT = 25
export const TEAMS_PLAN_PALETTE_SAVE_LIMIT = null

function formatPaletteGenerationLimitFeature(limit: number) {
  return `${limit} AI runs per month`
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
    description: 'Try the builder with a small monthly AI run budget and basic export tools.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    currency: 'usd',
    paletteGenerationLimit: FREE_PLAN_PALETTE_GENERATION_LIMIT,
    paletteSaveLimit: FREE_PLAN_PALETTE_SAVE_LIMIT,
    features: [
      formatPaletteGenerationLimitFeature(FREE_PLAN_PALETTE_GENERATION_LIMIT),
      formatPaletteSaveLimitFeature(FREE_PLAN_PALETTE_SAVE_LIMIT),
      'Generate themes, ramps, variants, and directions',
      'QA repair',
      'Export theme JSON',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For solo designers and developers who iterate often across the full AI toolkit.',
    monthlyPrice: 15,
    yearlyPrice: 150,
    currency: 'usd',
    paletteGenerationLimit: PRO_PLAN_PALETTE_GENERATION_LIMIT,
    paletteSaveLimit: PRO_PLAN_PALETTE_SAVE_LIMIT,
    features: [
      formatPaletteGenerationLimitFeature(PRO_PLAN_PALETTE_GENERATION_LIMIT),
      formatPaletteSaveLimitFeature(PRO_PLAN_PALETTE_SAVE_LIMIT),
      'All AI tools included',
      'QA repair',
      'Priority generation access',
      'Advanced export options',
    ],
  },
  {
    id: 'teams',
    name: 'Teams',
    description: 'For shared theme workflows with collaborators, larger AI budgets, and a common palette library.',
    monthlyPrice: 49,
    yearlyPrice: 490,
    currency: 'usd',
    paletteGenerationLimit: TEAMS_PLAN_PALETTE_GENERATION_LIMIT,
    paletteSaveLimit: TEAMS_PLAN_PALETTE_SAVE_LIMIT,
    features: [
      formatPaletteGenerationLimitFeature(TEAMS_PLAN_PALETTE_GENERATION_LIMIT),
      formatPaletteSaveLimitFeature(TEAMS_PLAN_PALETTE_SAVE_LIMIT),
      'All AI tools included',
      'QA repair',
      'Team collaboration workflow',
      'Shared palette library',
      'Up to 5 collaborators',
      'Faster generation during peak usage',
      'Priority support',
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
