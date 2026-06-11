import { defineEventHandler, readValidatedBody } from 'h3'
import { z } from 'zod'
import { isPaidPricingPlanId } from '../../../../app/data/pricing'
import type { PaidPricingPlan } from '~/types/pricing'
import { sendPricingPlanPurchaseConfirmationEmail, sendRegistrationConfirmationEmail } from '~~/server/services/email-service'
import { requireAdminSession } from '~~/server/utils/admin-auth'

const bodySchema = z.discriminatedUnion('template', [
  z.object({
    template: z.literal('registration'),
    recipientEmail: z.email('A valid recipient email is required'),
    recipientName: z.string().trim().optional(),
  }),
  z.object({
    template: z.literal('purchase'),
    recipientEmail: z.email('A valid recipient email is required'),
    recipientName: z.string().trim().optional(),
    planId: z.custom<PaidPricingPlan>(isPaidPricingPlanId, 'A valid paid pricing plan is required'),
    billingInterval: z.enum(['monthly', 'yearly']),
  }),
])

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)

  const body = await readValidatedBody(event, bodySchema.parse)

  if (body.template === 'registration') {
    await sendRegistrationConfirmationEmail({
      email: body.recipientEmail.trim().toLowerCase(),
      name: body.recipientName?.trim() || null,
    })

    return {
      ok: true,
      message: `Registration email sent to ${body.recipientEmail.trim().toLowerCase()}.`,
    }
  }

  await sendPricingPlanPurchaseConfirmationEmail({
    billingInterval: body.billingInterval,
    email: body.recipientEmail.trim().toLowerCase(),
    name: body.recipientName?.trim() || null,
    planId: body.planId,
  })

  return {
    ok: true,
    message: `${body.planId} ${body.billingInterval} purchase email sent to ${body.recipientEmail.trim().toLowerCase()}.`,
  }
})
