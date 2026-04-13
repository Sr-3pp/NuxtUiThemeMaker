import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import {
  paletteAuditGenerateRequestSchema,
  paletteAuditGenerateResponseSchema,
  paletteAuditResponseSchema,
} from '~~/server/domain/palette-ai-schema'
import { getPaletteQaReport } from '~~/server/services/palette-qa-service'
import { generateStructuredPaletteAiResult } from '~~/server/services/palette-ai'
import { setupAiEndpoint, finalizeAiEndpoint } from '~~/server/utils/ai-event-handler'

const instructions = [
  'Return only JSON.',
  'Act as a theme accessibility repair assistant.',
  'Review the supplied palette and QA report, then suggest fixes for low-contrast states and weak semantic or focus visibility.',
  'Return a short summary, a list of specific token fixes, and a fully patched palette.',
  'Each fix MUST be an object with token, mode, currentValue, suggestedValue, and reason fields.',
  'Never return fixes as plain strings - always use proper objects.',
  'Always include patchedPalette, even if only a few tokens change.',
  'Keep palette structure intact and preserve the palette name.',
  'Only change tokens that materially improve accessibility or clarity.',
  'All token values must be strings.',
  'Do not include markdown fences or commentary.',
].join(' ')

type PaletteDefinition = z.infer<typeof paletteAuditGenerateRequestSchema.shape.palette>

function ensureValidAuditResult(rawResult: unknown, fallbackPalette: PaletteDefinition) {
  if (!rawResult || typeof rawResult !== 'object') {
    return {
      summary: 'Applied audit-driven theme repair suggestions.',
      fixes: [],
      patchedPalette: fallbackPalette,
    }
  }

  const candidate = rawResult as {
    summary?: unknown
    fixes?: unknown
    patchedPalette?: unknown
  }

  return {
    summary: typeof candidate.summary === 'string' && candidate.summary.trim()
      ? candidate.summary.trim()
      : 'Applied audit-driven theme repair suggestions.',
    fixes: Array.isArray(candidate.fixes) ? candidate.fixes : [],
    patchedPalette: candidate.patchedPalette ?? fallbackPalette,
  }
}

export default defineEventHandler(async (event) => {
  const { session, access } = await setupAiEndpoint(event)
  const body = paletteAuditGenerateRequestSchema.parse(await readBody(event))
  const report = getPaletteQaReport(body.palette)

  const prompt = [
    `Repair every issue flagged in the QA report, prioritizing critical issues before warnings and warnings before informational cleanup.`,
    `Palette JSON: ${JSON.stringify(body.palette)}.`,
    `Theme QA report JSON: ${JSON.stringify(report)}.`,
    'Example fix object: {"token":"text.default","mode":"light","currentValue":"#94a3b8","suggestedValue":"#0f172a","reason":"Raises body copy contrast on the default background."}.',
    instructions,
  ].filter(Boolean).join(' ')

  const rawResult = await generateStructuredPaletteAiResult({
    prompt,
    schema: paletteAuditGenerateResponseSchema.partial({
      fixes: true,
      patchedPalette: true,
    }),
    responseSchema: paletteAuditResponseSchema,
  })
  
  const result = paletteAuditGenerateResponseSchema.parse(ensureValidAuditResult(rawResult, body.palette))

  await finalizeAiEndpoint(session, access)

  return result
})
