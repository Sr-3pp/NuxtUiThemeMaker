import { defineEventHandler, readValidatedBody } from 'h3'
import { z } from 'zod'
import type { StripeCheckoutRequest, StripeCheckoutResponse } from '~/types/stripe'
import { createStripeCheckoutSession } from '~~/server/services/stripe-service'
import { requireAuthSession } from '~~/server/utils/auth-session'

const checkoutSchema = z.object({
  planId: z.enum(['pro']),
  billingInterval: z.enum(['monthly', 'yearly']),
})

export default defineEventHandler(async (event) => {
  const { user } = await requireAuthSession(event)
  const body = await readValidatedBody(event, checkoutSchema.parse) as StripeCheckoutRequest

  const checkoutSession = await createStripeCheckoutSession({
    billingInterval: body.billingInterval,
    customerEmail: user.email,
    existingCustomerId: user.stripeCustomerId,
    planId: body.planId,
    userId: user.id,
  })

  return {
    id: checkoutSession.id,
    url: checkoutSession.url,
  } satisfies StripeCheckoutResponse
})
