import { defineEventHandler, readBody } from 'h3'
import { paletteGenerateRequestSchema } from '~~/server/domain/palette-ai-schema'
import { paletteDefinitionSchema, paletteResponseSchema } from '~~/server/domain/palette-schema'
import {
  assertPaletteAiAccess,
  finalizePaletteAiUsage,
  generateStructuredPaletteAiResult,
} from '~~/server/services/palette-ai'
import { getOptionalAuthSession } from '~~/server/utils/auth-session'

const paletteGenerationInstructions = [
  'Return only structured JSON for a palette.',
  'Match the app palette format exactly.',
  'This palette will be used by Nuxt UI semantic theme tokens.',
  'The generated values map to CSS variables such as --ui-primary, --ui-secondary, --ui-success, --ui-info, --ui-warning, --ui-error, --ui-text, --ui-text-muted, --ui-bg, --ui-bg-muted, --ui-border, --ui-border-accented, and --ui-ring.',
  'Choose colors with common Nuxt UI combinations in mind: primary actions on default and elevated surfaces, body text on default and muted backgrounds, highlighted text on accented surfaces, borders between layered surfaces, and focus rings around interactive controls.',
  'Include a creative palette name in the "name" field.',
  'The name should be short, distinctive, and fit the palette mood.',
  'Include name, modes.light, and modes.dark.',
  'Each mode must include color, text, bg, ui, and radius groups.',
  'Use all expected token keys in every group.',
  'The ui group must use the keys "border", "border-muted", "border-accented", and "ring".',
  'All values must be strings.',
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
  const session = await getOptionalAuthSession(event)
  const { session: authenticatedSession, access } = await assertPaletteAiAccess(session)
  const body = paletteGenerateRequestSchema.parse(await readBody(event))

  const promptParts = [
    `Theme request: ${body.prompt}.`,
    body.brandColors?.length ? `Anchor the palette to these brand colors: ${body.brandColors.join(', ')}.` : null,
    body.referenceSummary ? `Style reference: ${body.referenceSummary}.` : null,
    paletteGenerationInstructions,
  ].filter(Boolean)

  const generatedPalette = await generateStructuredPaletteAiResult({
    prompt: promptParts.join(' '),
    schema: paletteDefinitionSchema,
    responseSchema: paletteResponseSchema,
  })

  await finalizePaletteAiUsage(authenticatedSession, access)

  return generatedPalette
})
