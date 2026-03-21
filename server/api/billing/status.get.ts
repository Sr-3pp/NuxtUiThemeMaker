import { defineEventHandler } from 'h3'
import type { BillingStatus } from '~/types/billing'
import { getOptionalAuthSession } from '~~/server/utils/auth-session'

export default defineEventHandler(async (event) => {
  const session = await getOptionalAuthSession(event)

  if (!session) {
    return {
      hasActivePlan: false,
      isAdminUnlimited: false,
      plan: 'free',
      planInterval: null,
      planStatus: 'inactive',
    } satisfies BillingStatus
  }

  const isAdminUnlimited = session.user.level === 'admin'
  const hasActivePlan = isAdminUnlimited
    || (
      ['pro', 'team'].includes(session.user.plan)
      && ['active', 'trialing'].includes(session.user.planStatus)
    )

  return {
    hasActivePlan,
    isAdminUnlimited,
    plan: session.user.plan,
    planInterval: session.user.planInterval,
    planStatus: session.user.planStatus,
  } satisfies BillingStatus
})
