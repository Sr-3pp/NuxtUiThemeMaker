import { createPartFromBase64, createPartFromText } from '@google/genai'
import { defineEventHandler, readBody } from 'h3'
import { paletteGenerateRequestSchema } from '~~/server/domain/palette-ai-schema'
import { paletteDefinitionSchema, paletteResponseSchema } from '~~/server/domain/palette-schema'
import {
  assertPaletteAiAccess,
  finalizePaletteAiUsage,
  generateStructuredPaletteAiResult,
} from '~~/server/services/palette-ai'
import { getOptionalAuthSession } from '~~/server/utils/auth-session'
import { enforceAiRateLimit } from '~~/server/utils/rate-limit'
import { assertTrustedBrowserOrigin } from '~~/server/utils/request-origin'

const paletteGenerationInstructions = [
  'Return only structured JSON for a palette object.',
  'Match the app palette format exactly.',
  'This palette will be used to drive Nuxt UI semantic theme tokens.',
  'Choose colors with common Nuxt UI combinations in mind: primary actions on default and elevated surfaces, body text on default and muted backgrounds, highlighted text on accented surfaces, borders between layered surfaces, and focus rings around interactive controls.',
  'Include a creative palette name in name.',
  'The name should be short, distinctive, and fit the palette mood.',
  'Include name, modes.light, and modes.dark.',
  'Each palette mode must include color, text, bg, ui, and radius groups.',
  'Use all expected token keys in every group.',
  'The palette ui group must use the keys "border", "border-muted", "border-accented", and "ring".',
  'All palette values must be strings.',
  'Choose colors that are accessible and WCAG-conscious.',
  'Ensure text tokens are readable against their intended background tokens in both light and dark modes.',
  'Target at least WCAG AA contrast for normal text where applicable, and avoid low-contrast foreground/background pairs.',
  'Treat text.default on bg.default and bg.elevated as primary reading pairs, and keep text.dimmed/text.muted readable on bg.muted.',
  'Ensure text.highlighted remains readable when used with bg.accented and brand-colored UI states.',
  'Keep muted, accented, border, and ring colors visibly distinct without reducing readability.',
  'Do not include markdown fences or extra commentary.',
  'Use valid JSON with double-quoted property names.',
].join(' ')

function buildPaletteGenerationContents(promptText: string, referenceImage?: {
  data: string
  mimeType: string
}) {
  if (!referenceImage) {
    return undefined
  }

  return [
    createPartFromText(promptText),
    createPartFromBase64(referenceImage.data, referenceImage.mimeType),
  ]
}

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
  const basePrompt = promptParts.join(' ')

  const generatedPalette = await generateStructuredPaletteAiResult({
    prompt: basePrompt,
    contents: buildPaletteGenerationContents(basePrompt, body.referenceImage),
    schema: paletteDefinitionSchema,
    responseSchema: paletteResponseSchema,
  })

  await finalizePaletteAiUsage(authenticatedSession, access)

  return {
    palette: generatedPalette,
    ui: {},
  }
})
