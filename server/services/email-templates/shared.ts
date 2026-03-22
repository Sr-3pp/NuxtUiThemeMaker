export interface EmailTemplateContent {
  html: string
  text: string
}

export interface EmailTemplateLayoutInput {
  bodyHtml: string
  ctaHref?: string
  ctaLabel?: string
  eyebrow: string
  previewText: string
  siteName: string
  title: string
}

export function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function formatGreeting(name: string | null | undefined, email: string) {
  const trimmedName = name?.trim()
  return trimmedName || email
}

export function renderEmailLayout(input: EmailTemplateLayoutInput) {
  const safeTitle = escapeHtml(input.title)
  const safeSiteName = escapeHtml(input.siteName)
  const safeEyebrow = escapeHtml(input.eyebrow)
  const safePreviewText = escapeHtml(input.previewText)
  const ctaHtml = input.ctaHref && input.ctaLabel
    ? `
      <div style="margin-top: 32px;">
        <a
          href="${input.ctaHref}"
          style="display: inline-block; border-radius: 999px; background: #111827; color: #ffffff; padding: 12px 20px; text-decoration: none; font-weight: 600;"
        >
          ${escapeHtml(input.ctaLabel)}
        </a>
      </div>
    `
    : ''

  return `
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      ${safePreviewText}
    </div>
    <div style="margin:0; padding:32px 16px; background:#f3f4f6; font-family: Arial, sans-serif; color:#111827;">
      <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e5e7eb; border-radius:24px; overflow:hidden;">
        <div style="padding:20px 24px; background:linear-gradient(135deg, #111827 0%, #334155 100%); color:#ffffff;">
          <p style="margin:0 0 8px; font-size:12px; letter-spacing:0.18em; text-transform:uppercase; opacity:0.78;">${safeEyebrow}</p>
          <h1 style="margin:0; font-size:28px; line-height:1.15;">${safeTitle}</h1>
        </div>
        <div style="padding:32px 24px;">
          ${input.bodyHtml}
          ${ctaHtml}
        </div>
        <div style="padding:18px 24px; border-top:1px solid #e5e7eb; background:#f9fafb;">
          <p style="margin:0; font-size:13px; line-height:1.5; color:#6b7280;">
            Sent by ${safeSiteName}
          </p>
        </div>
      </div>
    </div>
  `
}
