import { defineEventHandler, readBody } from 'h3'
import { paletteVariantGenerateRequestSchema, paletteVariantGenerateResponseSchema } from '~~/server/domain/palette-ai-schema'
import { generateStructuredPaletteAiResult } from '~~/server/services/palette-ai'
import { setupAiEndpoint, finalizeAiEndpoint } from '~~/server/utils/ai-event-handler'

const instructions = [
  'Return only JSON.',
  'Generate Nuxt UI component overrides from a mood, product, or brand prompt.',
  'Output a short summary and a components object only.',
  'The components object must follow the current Nuxt UI app config component schema.',
  'Use only actual Nuxt UI-style component keys and nested keys such as base, slots, variants, states, and defaultVariants when relevant.',
  'Prefer practical overrides for button, input, card, badge, alert, modal, table, and navigation patterns.',
  'STRUCTURE RULES: base and each state value must be an object of string key-value pairs, e.g. "base": { "class": "rounded-lg" }.',
  'Each slot value must be an object of string key-value pairs, e.g. "slots": { "base": { "class": "rounded-lg" }, "label": { "class": "font-semibold" } }. Never use a plain string as a slot value.',
  'Each variant leaf value must be an object of string key-value pairs, e.g. "variants": { "size": { "md": { "class": "px-4 py-2" } } }. Never use a plain string as a variant leaf value.',
  'Every token value within those objects must be a string.',
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
