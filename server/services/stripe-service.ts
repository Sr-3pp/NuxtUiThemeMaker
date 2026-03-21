import { createError } from 'h3'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { pricingPlans } from '~/data/pricing'
import type { BillingInterval, PricingPlan } from '~/types/pricing'

const STRIPE_API_BASE_URL = 'https://api.stripe.com/v1'
const STRIPE_WEBHOOK_TOLERANCE_SECONDS = 300

function getStripeSecretKey() {
  const config = useRuntimeConfig()

  if (!config.stripeSecretKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Stripe secret key is not configured',
    })
  }

  return config.stripeSecretKey
}

function getStripeWebhookSecret() {
  const config = useRuntimeConfig()

  if (!config.stripeWebhookSecret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Stripe webhook secret is not configured',
    })
  }

  return config.stripeWebhookSecret
}

function getSiteUrl() {
  const config = useRuntimeConfig()
  return config.public.siteUrl
}

function getPlanById(planId: PricingPlan['id']) {
  const plan = pricingPlans.find(entry => entry.id === planId)

  if (!plan) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid pricing plan',
    })
  }

  return plan
}

function getUnitAmount(plan: PricingPlan, billingInterval: BillingInterval) {
  return (billingInterval === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice) * 100
}

function buildRecurringInterval(billingInterval: BillingInterval) {
  if (billingInterval === 'yearly') {
    return { interval: 'year', interval_count: '1' }
  }

  return { interval: 'month', interval_count: '1' }
}

async function stripeRequest<T>(path: string, init: RequestInit) {
  const response = await fetch(`${STRIPE_API_BASE_URL}${path}`, init)

  if (!response.ok) {
    const errorBody = await response.text()

    throw createError({
      statusCode: response.status,
      statusMessage: errorBody || 'Stripe request failed',
    })
  }

  return response.json() as Promise<T>
}

export async function createStripeCheckoutSession(input: {
  billingInterval: BillingInterval
  customerEmail: string
  existingCustomerId: string | null
  planId: PricingPlan['id']
  userId: string
}) {
  const secretKey = getStripeSecretKey()
  const siteUrl = getSiteUrl()
  const plan = getPlanById(input.planId)
  const unitAmount = getUnitAmount(plan, input.billingInterval)
  const recurring = buildRecurringInterval(input.billingInterval)
  const form = new URLSearchParams()

  form.set('mode', 'subscription')
  form.set('success_url', `${siteUrl}/pricing?checkout=success`)
  form.set('cancel_url', `${siteUrl}/pricing?checkout=canceled`)
  form.set('client_reference_id', input.userId)
  form.set('metadata[planId]', input.planId)
  form.set('metadata[billingInterval]', input.billingInterval)
  form.set('line_items[0][quantity]', '1')
  form.set('line_items[0][price_data][currency]', plan.currency)
  form.set('line_items[0][price_data][unit_amount]', String(unitAmount))
  form.set('line_items[0][price_data][product_data][name]', `${plan.name} ${input.billingInterval === 'monthly' ? 'Monthly' : 'Yearly'}`)
  form.set('line_items[0][price_data][product_data][description]', plan.description)
  form.set('line_items[0][price_data][recurring][interval]', recurring.interval)
  form.set('line_items[0][price_data][recurring][interval_count]', recurring.interval_count)
  form.set('subscription_data[metadata][planId]', input.planId)
  form.set('subscription_data[metadata][billingInterval]', input.billingInterval)
  form.set('subscription_data[metadata][userId]', input.userId)

  if (input.existingCustomerId) {
    form.set('customer', input.existingCustomerId)
  } else {
    form.set('customer_email', input.customerEmail)
  }

  return stripeRequest<{ id: string, url: string | null }>('/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  })
}

export function verifyStripeWebhookSignature(rawBody: string, stripeSignatureHeader: string | undefined) {
  if (!stripeSignatureHeader) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing Stripe signature header',
    })
  }

  const webhookSecret = getStripeWebhookSecret()
  const signatureParts = stripeSignatureHeader.split(',').map(part => part.trim())
  const timestamp = signatureParts.find(part => part.startsWith('t='))?.slice(2)
  const expectedSignature = signatureParts.find(part => part.startsWith('v1='))?.slice(3)

  if (!timestamp || !expectedSignature) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid Stripe signature header',
    })
  }

  const timestampSeconds = Number(timestamp)

  if (!Number.isFinite(timestampSeconds) || Math.abs(Math.floor(Date.now() / 1000) - timestampSeconds) > STRIPE_WEBHOOK_TOLERANCE_SECONDS) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Stripe webhook signature timestamp is invalid',
    })
  }

  const payload = `${timestamp}.${rawBody}`
  const digest = createHmac('sha256', webhookSecret).update(payload, 'utf8').digest('hex')
  const expected = Buffer.from(expectedSignature, 'hex')
  const actual = Buffer.from(digest, 'hex')

  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid Stripe webhook signature',
    })
  }
}
