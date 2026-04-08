import { defineEventHandler, readBody } from 'h3'
import { paletteDirectionsGenerateRequestSchema, paletteDirectionsGenerateResponseSchema } from '~~/server/domain/palette-ai-schema'
import {
  assertPaletteAiAccess,
  finalizePaletteAiUsage,
  generateStructuredPaletteAiResult,
} from '~~/server/services/palette-ai'
import { getOptionalAuthSession } from '~~/server/utils/auth-session'

const instructions = [
  'Return only JSON.',
  'Generate alternative theme directions from the supplied palette.',
  'Preserve the core product domain but shift the art direction, tone, and semantic emphasis.',
  'Each direction must include a name, a concise rationale, and a full palette object.',
  'Keep the output accessible and realistic for Nuxt UI theme usage.',
  'Do not include markdown fences or commentary.',
].join(' ')

export default defineEventHandler(async (event) => {
  const session = await getOptionalAuthSession(event)
  const { session: authenticatedSession, access } = await assertPaletteAiAccess(session)
  const body = paletteDirectionsGenerateRequestSchema.parse(await readBody(event))

  const prompt = [
    `Generate ${body.count ?? 3} alternative theme directions.`,
    body.prompt ? `Direction brief: ${body.prompt}.` : null,
    `Source palette JSON: ${JSON.stringify(body.palette)}.`,
    instructions,
  ].filter(Boolean).join(' ')

  const result = await generateStructuredPaletteAiResult({
    prompt,
    schema: paletteDirectionsGenerateResponseSchema,
  })

  await finalizePaletteAiUsage(authenticatedSession, access)

  return result
})
