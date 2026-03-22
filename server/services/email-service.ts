import { pricingPlans } from '~/data/pricing'
import type { BillingInterval, PricingPlanId } from '~/types/pricing'
import { createError } from 'h3'
import { buildPurchaseConfirmationTemplate } from './email-templates/purchase-confirmation'
import { buildRegistrationConfirmationTemplate } from './email-templates/registration-confirmation'
import { formatGreeting } from './email-templates/shared'

const RESEND_API_URL = 'https://api.resend.com/emails'

function getSiteConfig() {
  const config = useRuntimeConfig()

  return {
    resendApiKey: config.resendApiKey,
    resendFrom: config.resendFrom,
    siteName: config.public.siteName,
    siteUrl: config.public.siteUrl.replace(/\/+$/, ''),
  }
}

function getPlanDetails(planId: PricingPlanId, billingInterval: BillingInterval) {
  const plan = pricingPlans.find(entry => entry.id === planId)

  if (!plan) {
    throw new Error(`Unknown pricing plan: ${planId}`)
  }

  return {
    name: plan.name,
    price: billingInterval === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice,
    currency: plan.currency.toUpperCase(),
  }
}

async function sendEmail(input: {
  html: string
  idempotencyKey?: string
  subject: string
  text: string
  to: string
}) {
  const { resendApiKey, resendFrom } = getSiteConfig()

  if (!resendApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Resend API key is not configured',
    })
  }

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
      ...(input.idempotencyKey ? { 'Idempotency-Key': input.idempotencyKey } : {}),
    },
    body: JSON.stringify({
      from: resendFrom,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()

    throw createError({
      statusCode: response.status,
      statusMessage: errorBody || 'Resend email request failed',
    })
  }

  return response.json()
}

export async function sendRegistrationConfirmationEmail(input: {
  email: string
  idempotencyKey?: string
  name?: string | null
}) {
  const { siteName, siteUrl } = getSiteConfig()
  const recipientName = formatGreeting(input.name, input.email)
  const template = buildRegistrationConfirmationTemplate({
    recipientName,
    siteName,
    siteUrl,
  })

  await sendEmail({
    to: input.email,
    subject: `Welcome to ${siteName}`,
    text: template.text,
    html: template.html,
    idempotencyKey: input.idempotencyKey,
  })
}

export async function sendPricingPlanPurchaseConfirmationEmail(input: {
  billingInterval: BillingInterval
  email: string
  idempotencyKey?: string
  name?: string | null
  planId: PricingPlanId
}) {
  const { siteName, siteUrl } = getSiteConfig()
  const recipientName = formatGreeting(input.name, input.email)
  const plan = getPlanDetails(input.planId, input.billingInterval)
  const template = buildPurchaseConfirmationTemplate({
    billingInterval: input.billingInterval,
    currency: plan.currency,
    planName: plan.name,
    price: plan.price,
    pricingUrl: `${siteUrl}/pricing`,
    recipientName,
    siteName,
  })

  await sendEmail({
    to: input.email,
    subject: `${plan.name} plan purchase confirmed`,
    text: template.text,
    html: template.html,
    idempotencyKey: input.idempotencyKey,
  })
}
