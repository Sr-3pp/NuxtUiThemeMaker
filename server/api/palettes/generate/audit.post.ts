import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import {
  paletteAuditGenerateRequestSchema,
  paletteAuditGenerateResponseSchema,
  paletteAuditResponseSchema,
} from '~~/server/domain/palette-ai-schema'
import { getPaletteQaReport } from '~~/server/services/palette-qa-service'
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
  'Act as a theme accessibility repair assistant.',
  'Review the supplied palette and QA report, then suggest fixes for low-contrast states and weak semantic or focus visibility.',
  'Return a short summary, a list of specific token fixes, and a fully patched palette.',
  'Each fix must be an object with token, mode, currentValue, suggestedValue, and reason fields.',
  'Never return fixes as plain strings.',
  'Always include patchedPalette, even if only a few tokens change.',
  'Keep palette structure intact and preserve the palette name.',
  'Only change tokens that materially improve accessibility or clarity.',
  'All token values must be strings.',
  'Do not include markdown fences or commentary.',
].join(' ')

function normalizeAuditFix(rawFix: unknown) {
  if (rawFix && typeof rawFix === 'object') {
    return rawFix
  }

  if (typeof rawFix !== 'string') {
    return null
  }

  const text = rawFix.trim()

  if (!text) {
    return null
  }

  const [lead, ...rest] = text.split(/[:.-]\s+/)
  const tokenMatch = text.match(/\b(?:color|text|bg|ui|radius)\.[A-Za-z0-9-]+\b/)
  const suggestedValueMatch = text.match(/#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})|var\(--[^)]+\)|\b\d+(?:px|rem|em|%)\b/)
  const modeMatch = text.match(/\b(light|dark|shared)\b/i)

  return {
    token: tokenMatch?.[0] ?? (lead.trim() || 'unspecified'),
    mode: (modeMatch?.[1]?.toLowerCase() ?? 'shared') as 'light' | 'dark' | 'shared',
    currentValue: null,
    suggestedValue: suggestedValueMatch?.[0] ?? 'unchanged',
    reason: rest.join(': ').trim() || text,
  }
}

type PaletteDefinition = z.infer<typeof paletteAuditGenerateRequestSchema.shape.palette>

function normalizeAuditResult(rawResult: unknown, fallbackPalette: PaletteDefinition) {
  if (!rawResult || typeof rawResult !== 'object') {
    return rawResult
  }

  const candidate = rawResult as {
    summary?: unknown
    fixes?: unknown
    patchedPalette?: unknown
  }

  const fixes = Array.isArray(candidate.fixes)
    ? candidate.fixes.map(normalizeAuditFix).filter(Boolean)
    : []

  return {
    summary: typeof candidate.summary === 'string' && candidate.summary.trim()
      ? candidate.summary.trim()
      : 'Applied audit-driven theme repair suggestions.',
    fixes,
    patchedPalette: candidate.patchedPalette ?? fallbackPalette,
  }
}

export default defineEventHandler(async (event) => {
  assertTrustedBrowserOrigin(event)

  const session = await getOptionalAuthSession(event)
  const { session: authenticatedSession, access } = await assertPaletteAiAccess(session)
  enforceAiRateLimit(event, authenticatedSession.user.id)
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
    }).extend({
      fixes: paletteAuditGenerateResponseSchema.shape.fixes.or(z.array(z.string().trim().min(1))).optional(),
      patchedPalette: paletteAuditGenerateResponseSchema.shape.patchedPalette.optional(),
    }),
    responseSchema: paletteAuditResponseSchema,
  })
  const result = paletteAuditGenerateResponseSchema.parse(normalizeAuditResult(rawResult, body.palette))

  await finalizePaletteAiUsage(authenticatedSession, access)

  return result
})
