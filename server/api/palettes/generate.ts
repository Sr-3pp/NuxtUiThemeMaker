import { createPartFromBase64, createPartFromText } from '@google/genai'
import { defineEventHandler, readBody } from 'h3'
import { paletteGenerateRequestSchema } from '~~/server/domain/palette-ai-schema'
import { paletteGenerateResultResponseSchema, paletteGenerateResultSchema } from '~~/server/domain/palette-schema'
import {
  assertPaletteAiAccess,
  finalizePaletteAiUsage,
  generateStructuredPaletteAiResult,
} from '~~/server/services/palette-ai'
import { getOptionalAuthSession } from '~~/server/utils/auth-session'
import { enforceAiRateLimit } from '~~/server/utils/rate-limit'
import { assertTrustedBrowserOrigin } from '~~/server/utils/request-origin'

const paletteGenerationInstructions = [
  'Return only structured JSON with two top-level keys: "palette" and "ui".',
  'Match the app palette format exactly inside the "palette" key.',
  'This palette will be used by Nuxt UI semantic theme tokens and live app config.',
  'The "ui" key must contain direct Nuxt UI app config overrides, as if it were defineAppConfig({ ui: ... }).',
  'Use component keys like card, button, input, modal, table, badge, alert, tabs, navigationMenu, dropdownMenu, select, textarea, dashboardPanel, dashboardSidebar, and others when relevant.',
  'Inside each component config, prefer realistic Nuxt UI keys such as slots, variants, compoundVariants, and defaultVariants when useful.',
  'Generate real utility-class strings directly in "ui"; do not return a higher-level recipe or abstraction layer.',
  'The generated values map to CSS variables such as --ui-primary, --ui-secondary, --ui-success, --ui-info, --ui-warning, --ui-error, --ui-text, --ui-text-muted, --ui-bg, --ui-bg-muted, --ui-border, --ui-border-accented, and --ui-ring.',
  'Choose colors with common Nuxt UI combinations in mind: primary actions on default and elevated surfaces, body text on default and muted backgrounds, highlighted text on accented surfaces, borders between layered surfaces, and focus rings around interactive controls.',
  'Include a creative palette name in palette.name.',
  'The name should be short, distinctive, and fit the palette mood.',
  'Include palette.name, palette.modes.light, and palette.modes.dark.',
  'Each palette mode must include color, text, bg, ui, and radius groups.',
  'Use all expected token keys in every group.',
  'The palette ui group must use the keys "border", "border-muted", "border-accented", and "ring".',
  'All palette values must be strings.',
  'Use semantic Nuxt UI classes like bg-default, bg-elevated, text-default, text-highlighted, ring-default, divide-default, border-default, and color-mix-friendly utility classes when appropriate.',
  'Make the returned ui config practical and maintainable, but complete enough to visibly restyle the app live.',
  'Choose colors that are accessible and WCAG-conscious.',
  'Ensure text tokens are readable against their intended background tokens in both light and dark modes.',
  'Target at least WCAG AA contrast for normal text where applicable, and avoid low-contrast foreground/background pairs.',
  'Treat text.default on bg.default and bg.elevated as primary reading pairs, and keep text.dimmed/text.muted readable on bg.muted.',
  'Ensure text.highlighted remains readable when used with bg.accented and brand-colored UI states.',
  'Keep muted, accented, border, and ring colors visibly distinct without reducing readability.',
  'Do not include markdown fences or extra commentary.',
  'Use valid JSON with double-quoted property names.',
].join(' ')

export default defineEventHandler(async (event) => {
  assertTrustedBrowserOrigin(event)

  const session = await getOptionalAuthSession(event)
  const { session: authenticatedSession, access } = await assertPaletteAiAccess(session)
  enforceAiRateLimit(event, authenticatedSession?.user.id ?? null)
  const body = paletteGenerateRequestSchema.parse(await readBody(event))

  const promptParts = [
    `Theme request: ${body.prompt}.`,
    body.brandColors?.length ? `Anchor the palette to these brand colors: ${body.brandColors.join(', ')}.` : null,
    body.referenceSummary ? `Style reference: ${body.referenceSummary}.` : null,
    body.referenceImage ? 'A screenshot or visual style reference image is attached. Extract layout mood, contrast patterns, surface treatment, and accent behavior from it.' : null,
    paletteGenerationInstructions,
  ].filter(Boolean)

  const generatedPalette = await generateStructuredPaletteAiResult({
    prompt: promptParts.join(' '),
    contents: body.referenceImage
      ? [
          createPartFromText(promptParts.join(' ')),
          createPartFromBase64(body.referenceImage.data, body.referenceImage.mimeType),
        ]
      : undefined,
    schema: paletteGenerateResultSchema,
    responseSchema: paletteGenerateResultResponseSchema,
  })

  await finalizePaletteAiUsage(authenticatedSession, access)

  return generatedPalette
})
