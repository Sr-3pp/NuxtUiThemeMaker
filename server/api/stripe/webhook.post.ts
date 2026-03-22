import { createError, defineEventHandler, getHeader, readRawBody } from 'h3'
import {
  findUserByEmail,
  findUserById,
  findUserByStripeCustomerId,
  updateBillingPlanForUser,
  updateEmailDeliveryForUser,
} from '~~/server/db/repositories/user-repository'
import { sendPricingPlanPurchaseConfirmationEmail } from '~~/server/services/email-service'
import { verifyStripeWebhookSignature } from '~~/server/services/stripe-service'
import type { BillingInterval, PricingPlanId } from '~/types/pricing'
import type { PaidUserPlan, StripeEvent, UserPlan, UserPlanStatus } from '~~/server/types/stripe-webhook'

function toDateFromUnix(timestamp: unknown) {
  return typeof timestamp === 'number' ? new Date(timestamp * 1000) : null
}

function toPlanStatus(status: unknown): UserPlanStatus {
  switch (status) {
    case 'active':
      return 'active'
    case 'trialing':
      return 'trialing'
    case 'past_due':
      return 'past_due'
    case 'canceled':
    case 'unpaid':
      return 'canceled'
    default:
      return 'inactive'
  }
}

function getMetadataValue(
  metadata: Record<string, unknown> | undefined,
  key: string,
) {
  return typeof metadata?.[key] === 'string' ? metadata[key] : null
}

function toBillingInterval(value: unknown): BillingInterval | null {
  return value === 'monthly' || value === 'yearly' ? value : null
}

function getPayloadMetadata(payload: Record<string, unknown>) {
  return payload.metadata && typeof payload.metadata === 'object'
    ? payload.metadata as Record<string, unknown>
    : undefined
}

function getCustomerEmail(payload: Record<string, unknown>) {
  if (typeof payload.customer_email === 'string') {
    return payload.customer_email
  }

  if (payload.customer_details && typeof payload.customer_details === 'object') {
    const customerDetails = payload.customer_details as Record<string, unknown>

    if (typeof customerDetails.email === 'string') {
      return customerDetails.email
    }
  }

  return null
}

function toPaidPlan(planId: unknown, fallback: UserPlan = 'pro'): PaidUserPlan {
  if (planId === 'team') {
    return 'team'
  }

  if (planId === 'pro') {
    return 'pro'
  }

  return fallback === 'team' ? 'team' : 'pro'
}

function toPlanForStatus(status: UserPlanStatus, planId: unknown, fallback: UserPlan = 'pro'): UserPlan {
  if (status === 'inactive' || status === 'canceled') {
    return 'free'
  }

  return toPaidPlan(planId, fallback === 'team' ? 'team' : 'pro')
}

async function resolveUserForCheckoutSession(payload: Record<string, unknown>) {
  const userId = typeof payload.client_reference_id === 'string' ? payload.client_reference_id : null
  const customerEmail = getCustomerEmail(payload)

  if (userId) {
    const user = await findUserById(userId)

    if (user) {
      return user
    }
  }

  if (customerEmail) {
    return findUserByEmail(customerEmail)
  }

  return null
}

async function resolveUserForSubscriptionEvent(payload: Record<string, unknown>) {
  const stripeCustomerId = typeof payload.customer === 'string' ? payload.customer : null

  if (stripeCustomerId) {
    const user = await findUserByStripeCustomerId(stripeCustomerId)

    if (user) {
      return user
    }
  }

  const metadata = getPayloadMetadata(payload)
  const metadataUserId = getMetadataValue(metadata, 'userId')

  if (metadataUserId) {
    const user = await findUserById(metadataUserId)

    if (user) {
      return user
    }
  }

  return null
}

function getLastPurchaseConfirmationId(user: Record<string, unknown> | null | undefined) {
  return typeof user?.lastPurchaseConfirmationId === 'string' ? user.lastPurchaseConfirmationId : null
}

export default defineEventHandler(async (event) => {
  const rawBody = await readRawBody(event, 'utf8')

  if (!rawBody) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing webhook body',
    })
  }

  verifyStripeWebhookSignature(rawBody, getHeader(event, 'stripe-signature'))

  const stripeEvent = JSON.parse(rawBody) as StripeEvent
  const payload = stripeEvent.data?.object ?? {}
  const stripeEventId = typeof (payload as Record<string, unknown>).id === 'string'
    ? (payload as Record<string, unknown>).id
    : 'unknown'

  if (stripeEvent.type === 'checkout.session.completed') {
    const checkoutSessionId = typeof payload.id === 'string' ? payload.id : null
    const stripeCustomerId = typeof payload.customer === 'string' ? payload.customer : null
    const stripeSubscriptionId = typeof payload.subscription === 'string' ? payload.subscription : null
    const metadata = getPayloadMetadata(payload)
    const planId = getMetadataValue(metadata, 'planId')
    const planInterval = toBillingInterval(getMetadataValue(metadata, 'billingInterval'))
    const user = await resolveUserForCheckoutSession(payload)

    if (user && stripeCustomerId) {
      const updatedUser = await updateBillingPlanForUser(String(user.id ?? user._id), {
        plan: toPaidPlan(planId),
        planStatus: 'active',
        planExpiresAt: null,
        planInterval,
        stripeCustomerId,
        stripeSubscriptionId,
      })

      if (!updatedUser) {
        console.error('[stripe webhook] failed to update user after checkout.session.completed', {
          stripeEventId,
          stripeCustomerId,
          userId: String(user.id ?? user._id),
        })

        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to update billing plan for checkout session',
        })
      }

      if (
        checkoutSessionId
        && planInterval
        && (planId === 'pro' || planId === 'team')
        && getLastPurchaseConfirmationId(user as Record<string, unknown>) !== checkoutSessionId
      ) {
        try {
          await sendPricingPlanPurchaseConfirmationEmail({
            billingInterval: planInterval,
            email: String(updatedUser.email ?? user.email ?? ''),
            name: typeof updatedUser.name === 'string' ? updatedUser.name : typeof user.name === 'string' ? user.name : null,
            planId,
          })

          await updateEmailDeliveryForUser(String(updatedUser.id ?? updatedUser._id ?? user.id ?? user._id), {
            lastPurchaseConfirmationId: checkoutSessionId,
          })
        } catch (error) {
          console.error('[stripe webhook] failed to send purchase confirmation email', {
            stripeEventId,
            checkoutSessionId,
            userId: String(updatedUser.id ?? updatedUser._id ?? user.id ?? user._id),
            error,
          })
        }
      }

      return { received: true }
    }

    console.error('[stripe webhook] could not resolve user for checkout.session.completed', {
      stripeEventId,
      stripeCustomerId,
      clientReferenceId: typeof payload.client_reference_id === 'string' ? payload.client_reference_id : null,
      customerEmail: getCustomerEmail(payload),
    })
  }

  if (stripeEvent.type === 'customer.subscription.updated' || stripeEvent.type === 'customer.subscription.deleted') {
    const stripeCustomerId = typeof payload.customer === 'string' ? payload.customer : null
    const stripeSubscriptionId = typeof payload.id === 'string' ? payload.id : null
    const user = await resolveUserForSubscriptionEvent(payload)

    if (stripeCustomerId && user) {
      const metadata = getPayloadMetadata(payload)
      const planId = getMetadataValue(metadata, 'planId') ?? (user.plan as PricingPlanId | 'free' | undefined)
      const planInterval = toBillingInterval(getMetadataValue(metadata, 'billingInterval')) ?? user.planInterval ?? null
      const status = toPlanStatus(payload.status)
      const updatedUser = await updateBillingPlanForUser(String(user.id ?? user._id), {
        plan: toPlanForStatus(status, planId, user.plan === 'team' ? 'team' : 'pro'),
        planStatus: status,
        planExpiresAt: toDateFromUnix(payload.current_period_end),
        planInterval,
        stripeCustomerId,
        stripeSubscriptionId,
      })

      if (!updatedUser) {
        console.error('[stripe webhook] failed to update user after subscription event', {
          stripeEventId,
          stripeCustomerId,
          userId: String(user.id ?? user._id),
          eventType: stripeEvent.type,
        })

        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to update billing plan for subscription event',
        })
      }

      return { received: true }
    }

    console.error('[stripe webhook] could not resolve user for subscription event', {
      stripeEventId,
      stripeCustomerId,
      metadataUserId: getMetadataValue(getPayloadMetadata(payload), 'userId'),
      eventType: stripeEvent.type,
    })

    return { received: true }
  }

  if (stripeEvent.type === 'invoice.payment_failed') {
    const stripeCustomerId = typeof payload.customer === 'string' ? payload.customer : null
    const stripeSubscriptionId = typeof payload.subscription === 'string' ? payload.subscription : null
    const user = await resolveUserForSubscriptionEvent(payload)

    if (stripeCustomerId && user) {
      const currentPlan = user.plan === 'team' ? 'team' : 'pro'
      const updatedUser = await updateBillingPlanForUser(String(user.id ?? user._id), {
        plan: currentPlan,
        planStatus: 'past_due',
        planExpiresAt: user.planExpiresAt instanceof Date ? user.planExpiresAt : null,
        planInterval: user.planInterval ?? null,
        stripeCustomerId,
        stripeSubscriptionId: stripeSubscriptionId ?? user.stripeSubscriptionId ?? null,
      })

      if (!updatedUser) {
        console.error('[stripe webhook] failed to update user after invoice.payment_failed', {
          stripeEventId,
          stripeCustomerId,
          userId: String(user.id ?? user._id),
        })

        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to update billing plan for failed invoice',
        })
      }
    }
  }

  return { received: true }
})
