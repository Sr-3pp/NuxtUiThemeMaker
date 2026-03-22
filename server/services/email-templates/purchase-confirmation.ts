import type { BillingInterval } from '~/types/pricing'
import type { EmailTemplateContent } from './shared'
import { escapeHtml, renderEmailLayout } from './shared'

export function buildPurchaseConfirmationTemplate(input: {
  billingInterval: BillingInterval
  currency: string
  planName: string
  price: number
  pricingUrl: string
  recipientName: string
  siteName: string
}): EmailTemplateContent {
  const intervalLabel = input.billingInterval === 'yearly' ? 'yearly' : 'monthly'
  const amountLabel = `${input.currency} ${input.price}/${input.billingInterval === 'yearly' ? 'year' : 'month'}`

  return {
    text: [
      `Hi ${input.recipientName},`,
      '',
      `Your ${input.planName} ${intervalLabel} plan is now active on ${input.siteName}.`,
      `Amount: ${amountLabel}`,
      '',
      `Manage your plan: ${input.pricingUrl}`,
    ].join('\n'),
    html: renderEmailLayout({
      eyebrow: 'Plan Activated',
      previewText: `Your ${input.planName} plan is now active.`,
      siteName: input.siteName,
      title: `${input.planName} plan confirmed`,
      ctaHref: input.pricingUrl,
      ctaLabel: 'Manage your plan',
      bodyHtml: `
        <p style="margin:0 0 16px; font-size:16px; line-height:1.7;">Hi ${escapeHtml(input.recipientName)},</p>
        <p style="margin:0 0 20px; font-size:16px; line-height:1.7;">
          Your <strong>${escapeHtml(input.planName)}</strong> ${escapeHtml(intervalLabel)} plan is now active on <strong>${escapeHtml(input.siteName)}</strong>.
        </p>
        <div style="display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:12px; margin-top:24px;">
          <div style="border:1px solid #e5e7eb; border-radius:20px; padding:18px 20px; background:#f9fafb;">
            <p style="margin:0 0 8px; font-size:13px; letter-spacing:0.14em; text-transform:uppercase; color:#6b7280;">Plan</p>
            <p style="margin:0; font-size:18px; font-weight:600; color:#111827;">${escapeHtml(input.planName)}</p>
          </div>
          <div style="border:1px solid #e5e7eb; border-radius:20px; padding:18px 20px; background:#f9fafb;">
            <p style="margin:0 0 8px; font-size:13px; letter-spacing:0.14em; text-transform:uppercase; color:#6b7280;">Amount</p>
            <p style="margin:0; font-size:18px; font-weight:600; color:#111827;">${escapeHtml(amountLabel)}</p>
          </div>
        </div>
      `,
    }),
  }
}
