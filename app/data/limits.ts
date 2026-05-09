export const FREE_PLAN_PALETTE_GENERATION_LIMIT = 5
export const PRO_PLAN_PALETTE_GENERATION_LIMIT = 60
export const TEAMS_PLAN_PALETTE_GENERATION_LIMIT = 300

export const FREE_PLAN_PALETTE_SAVE_LIMIT = 1
export const PRO_PLAN_PALETTE_SAVE_LIMIT = 25
export const TEAMS_PLAN_PALETTE_SAVE_LIMIT = null

export const planLimits = {
  free: {
    paletteGenerationLimit: FREE_PLAN_PALETTE_GENERATION_LIMIT,
    paletteSaveLimit: FREE_PLAN_PALETTE_SAVE_LIMIT,
  },
  pro: {
    paletteGenerationLimit: PRO_PLAN_PALETTE_GENERATION_LIMIT,
    paletteSaveLimit: PRO_PLAN_PALETTE_SAVE_LIMIT,
  },
  teams: {
    paletteGenerationLimit: TEAMS_PLAN_PALETTE_GENERATION_LIMIT,
    paletteSaveLimit: TEAMS_PLAN_PALETTE_SAVE_LIMIT,
  },
} as const

export type LimitedPlanId = keyof typeof planLimits
export type PlanStatus = 'inactive' | 'trialing' | 'active' | 'past_due' | 'canceled'

export function isLimitedPlanId(value: unknown): value is LimitedPlanId {
  return typeof value === 'string' && value in planLimits
}

export function isPaidLimitedPlanId(value: unknown): value is Exclude<LimitedPlanId, 'free'> {
  return isLimitedPlanId(value) && value !== 'free'
}

export function getPaletteSaveLimit(planId: string | undefined) {
  return isLimitedPlanId(planId)
    ? planLimits[planId].paletteSaveLimit
    : FREE_PLAN_PALETTE_SAVE_LIMIT
}

export function getPaletteGenerationLimit(planId: string | undefined) {
  return isLimitedPlanId(planId)
    ? planLimits[planId].paletteGenerationLimit
    : FREE_PLAN_PALETTE_GENERATION_LIMIT
}

export function getEffectivePaletteGenerationLimit(user: {
  isAdmin?: boolean
  plan?: string
  planStatus?: PlanStatus
}) {
  if (user.isAdmin) {
    return null
  }

  const hasActivePaidPlan = isPaidLimitedPlanId(user.plan)
    && (user.planStatus === 'active' || user.planStatus === 'trialing')

  return getPaletteGenerationLimit(hasActivePaidPlan ? user.plan : 'free')
}
