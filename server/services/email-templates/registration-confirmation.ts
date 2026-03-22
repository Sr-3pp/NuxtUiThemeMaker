import type { EmailTemplateContent } from './shared'
import { escapeHtml, renderEmailLayout } from './shared'

export function buildRegistrationConfirmationTemplate(input: {
  recipientName: string
  siteName: string
  siteUrl: string
}): EmailTemplateContent {
  const safeRecipientName = escapeHtml(input.recipientName)
  const safeSiteName = escapeHtml(input.siteName)

  return {
    text: [
      `Hi ${input.recipientName},`,
      '',
      `Your ${input.siteName} account is ready.`,
      'You can now sign in, save palettes, and manage your billing from the pricing page.',
      '',
      `Open the app: ${input.siteUrl}`,
    ].join('\n'),
    html: renderEmailLayout({
      eyebrow: 'Account Ready',
      previewText: `Your ${input.siteName} account is ready.`,
      siteName: input.siteName,
      title: `Welcome to ${input.siteName}`,
      ctaHref: input.siteUrl,
      ctaLabel: 'Open the app',
      bodyHtml: `
        <p style="margin:0 0 16px; font-size:16px; line-height:1.7;">Hi ${safeRecipientName},</p>
        <p style="margin:0 0 16px; font-size:16px; line-height:1.7;">
          Your account for <strong>${safeSiteName}</strong> is ready.
        </p>
        <div style="margin-top:24px; border:1px solid #e5e7eb; border-radius:20px; padding:18px 20px; background:#f9fafb;">
          <p style="margin:0 0 8px; font-size:13px; letter-spacing:0.14em; text-transform:uppercase; color:#6b7280;">
            What you can do now
          </p>
          <p style="margin:0; font-size:15px; line-height:1.7; color:#374151;">
            Save palettes, manage visibility, and review plan options from the pricing page.
          </p>
        </div>
      `,
    }),
  }
}
