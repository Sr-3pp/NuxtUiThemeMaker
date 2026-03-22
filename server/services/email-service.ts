import { pricingPlans } from '~/data/pricing'
import type { BillingInterval, PricingPlanId } from '~/types/pricing'
import { buildPurchaseConfirmationTemplate } from './email-templates/purchase-confirmation'
import { buildRegistrationConfirmationTemplate } from './email-templates/registration-confirmation'
import { formatGreeting } from './email-templates/shared'

function getSiteConfig() {
  const config = useRuntimeConfig()

  return {
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

export async function sendRegistrationConfirmationEmail(input: {
  email: string
  name?: string | null
}) {
  const { siteName, siteUrl } = getSiteConfig()
  const recipientName = formatGreeting(input.name, input.email)
  const template = buildRegistrationConfirmationTemplate({
    recipientName,
    siteName,
    siteUrl,
  })

  const { sendMail } = useNodeMailer()

  await sendMail({
    to: input.email,
    subject: `Welcome to ${siteName}`,
    text: template.text,
    html: template.html,
  })
}

export async function sendPricingPlanPurchaseConfirmationEmail(input: {
  billingInterval: BillingInterval
  email: string
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

  const { sendMail } = useNodeMailer()

  await sendMail({
    to: input.email,
    subject: `${plan.name} plan purchase confirmed`,
    text: template.text,
    html: template.html,
  })
}
