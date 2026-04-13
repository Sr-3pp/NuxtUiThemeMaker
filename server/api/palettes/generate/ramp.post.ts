import { defineEventHandler, readBody } from 'h3'
import { paletteRampGenerateRequestSchema, paletteRampGenerateResponseSchema } from '~~/server/domain/palette-ai-schema'
import { generateStructuredPaletteAiResult } from '~~/server/services/palette-ai'
import { setupAiEndpoint, finalizeAiEndpoint } from '~~/server/utils/ai-event-handler'

const instructions = [
  'Return only JSON.',
  'Generate full accessible color ramps from one or more brand colors.',
  'Use one ramp per input brand color unless two colors are functionally duplicates.',
  'Keep the 500 step close to the provided brand color.',
  'Each ramp must include the exact keys 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, and 950.',
  'Every populated value must be a hex color string.',
  'Make the lighter steps usable for subtle surfaces and the darker steps usable for emphasis and dark mode.',
  'Do not include markdown fences or commentary.',
].join(' ')

export default defineEventHandler(async (event) => {
  const { session, access } = await setupAiEndpoint(event)
  const body = paletteRampGenerateRequestSchema.parse(await readBody(event))

  const prompt = [
    body.paletteName ? `Palette name: ${body.paletteName}.` : null,
    `Brand colors: ${body.brandColors.join(', ')}.`,
    body.prompt ? `Context: ${body.prompt}.` : null,
    instructions,
  ].filter(Boolean).join(' ')

  const result = await generateStructuredPaletteAiResult({
    prompt,
    schema: paletteRampGenerateResponseSchema,
  })

  await finalizeAiEndpoint(session, access)

  return result
})
