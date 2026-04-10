import { defineEventHandler, readBody } from 'h3'
import { paletteVariantGenerateRequestSchema, paletteVariantGenerateResponseSchema } from '~~/server/domain/palette-ai-schema'
import {
  assertPaletteAiAccess,
  finalizePaletteAiUsage,
  generateStructuredPaletteAiResult,
} from '~~/server/services/palette-ai'
import { getOptionalAuthSession } from '~~/server/utils/auth-session'
import { enforceAiRateLimit } from '~~/server/utils/rate-limit'
import { assertTrustedBrowserOrigin } from '~~/server/utils/request-origin'

const instructions = [
  'Return only JSON.',
  'Generate Nuxt UI component theme variants from a mood or brand prompt.',
  'Output a short summary and a components object only.',
  'Prefer practical overrides for button, input, card, badge, alert, modal, table, and navigation patterns.',
  'Every token value must be a string.',
  'If a palette is provided, align overrides to it rather than inventing unrelated colors.',
  'Keep overrides sparse and intentional so the result is maintainable.',
  'Do not include markdown fences or commentary.',
].join(' ')

export default defineEventHandler(async (event) => {
  assertTrustedBrowserOrigin(event)

  const session = await getOptionalAuthSession(event)
  const { session: authenticatedSession, access } = await assertPaletteAiAccess(session)
  enforceAiRateLimit(event, authenticatedSession.user.id)
  const body = paletteVariantGenerateRequestSchema.parse(await readBody(event))

  const prompt = [
    `Variant brief: ${body.prompt}.`,
    body.componentKeys?.length ? `Focus on these components: ${body.componentKeys.join(', ')}.` : null,
    body.palette ? `Base palette JSON: ${JSON.stringify(body.palette)}.` : null,
    instructions,
  ].filter(Boolean).join(' ')

  const result = await generateStructuredPaletteAiResult({
    prompt,
    schema: paletteVariantGenerateResponseSchema,
  })

  await finalizePaletteAiUsage(authenticatedSession, access)

  return result
})
