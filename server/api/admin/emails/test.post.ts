import { createError, defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { sendPricingPlanPurchaseConfirmationEmail, sendRegistrationConfirmationEmail } from '~~/server/services/email-service'
import { requireAuthSession } from '~~/server/utils/auth-session'

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
    planId: z.enum(['pro', 'team']),
    billingInterval: z.enum(['monthly', 'yearly']),
  }),
])

export default defineEventHandler(async (event) => {
  const session = await requireAuthSession(event)

  if (!session.user.isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required',
    })
  }

  const body = bodySchema.parse(await readBody(event))

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
