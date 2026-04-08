import { defineEventHandler, readBody } from 'h3'
import { paletteAuditGenerateRequestSchema, paletteAuditGenerateResponseSchema } from '~~/server/domain/palette-ai-schema'
import { getPaletteQaReport } from '~~/server/services/palette-qa-service'
import {
  assertPaletteAiAccess,
  finalizePaletteAiUsage,
  generateStructuredPaletteAiResult,
} from '~~/server/services/palette-ai'
import { getOptionalAuthSession } from '~~/server/utils/auth-session'

const instructions = [
  'Return only JSON.',
  'Act as a theme accessibility repair assistant.',
  'Review the supplied palette and QA report, then suggest fixes for low-contrast states and weak semantic or focus visibility.',
  'Return a short summary, a list of specific token fixes, and a fully patched palette.',
  'Keep palette structure intact and preserve the palette name.',
  'Only change tokens that materially improve accessibility or clarity.',
  'All token values must be strings.',
  'Do not include markdown fences or commentary.',
].join(' ')

export default defineEventHandler(async (event) => {
  const session = await getOptionalAuthSession(event)
  const { session: authenticatedSession, access } = await assertPaletteAiAccess(session)
  const body = paletteAuditGenerateRequestSchema.parse(await readBody(event))
  const report = getPaletteQaReport(body.palette)

  const prompt = [
    body.prompt ? `Repair goal: ${body.prompt}.` : null,
    `Palette JSON: ${JSON.stringify(body.palette)}.`,
    `Theme QA report JSON: ${JSON.stringify(report)}.`,
    instructions,
  ].filter(Boolean).join(' ')

  const result = await generateStructuredPaletteAiResult({
    prompt,
    schema: paletteAuditGenerateResponseSchema,
  })

  await finalizePaletteAiUsage(authenticatedSession, access)

  return result
})
