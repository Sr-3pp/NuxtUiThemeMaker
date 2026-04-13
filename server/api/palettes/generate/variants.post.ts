import { defineEventHandler, readBody } from 'h3'
import { paletteVariantGenerateRequestSchema, paletteVariantGenerateResponseSchema } from '~~/server/domain/palette-ai-schema'
import { generateStructuredPaletteAiResult } from '~~/server/services/palette-ai'
import { setupAiEndpoint, finalizeAiEndpoint } from '~~/server/utils/ai-event-handler'

const instructions = [
  'Return only JSON.',
  'Generate Nuxt UI component overrides from a mood, product, or brand prompt.',
  'Output a short summary and a components object only.',
  'The components object must follow the current Nuxt UI app config component schema.',
  'Use only actual Nuxt UI-style component keys such as base, slots, variants, states, compoundVariants, and defaultVariants when relevant.',
  'Prefer practical overrides for button, input, card, badge, alert, modal, table, and navigation patterns.',
  'CRITICAL STRUCTURE RULES:',
  '- base must be a flat CSS class string, e.g. "base": "rounded-lg font-semibold shadow-sm"',
  '- Each slot value must be a flat CSS class string, e.g. "slots": { "base": "rounded-lg", "label": "font-semibold" }',
  '- Each variant leaf value must be a flat CSS class string, e.g. "variants": { "size": { "md": "px-4 py-2" } }',
  '- Each state value must be a flat CSS class string, e.g. "states": { "hover": "bg-primary-600" }',
  '- Never wrap values in objects like {"class": "..."}, always use flat strings',
  '- defaultVariants can reference variant keys, e.g. "defaultVariants": { "size": "md", "variant": "solid" }',
  'If a palette is provided, align overrides to it rather than inventing unrelated colors.',
  'Use the current palette description, semantic tokens, surfaces, borders, and radius language to keep the component layer visually aligned.',
  'Keep overrides sparse and intentional so the result is maintainable.',
  'Do not include markdown fences or commentary.',
].join(' ')

export default defineEventHandler(async (event) => {
  const { session, access } = await setupAiEndpoint(event)
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

  await finalizeAiEndpoint(session, access)

  return result
})
