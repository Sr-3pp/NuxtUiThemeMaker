import { z } from 'zod'
import { paletteDefinitionSchema, paletteResponseSchema } from '~~/server/domain/palette-schema'

const AI_PROMPT_MAX_LENGTH = 1500
const AI_REFERENCE_SUMMARY_MAX_LENGTH = 2500
const AI_REFERENCE_IMAGE_DATA_MAX_LENGTH = 3_000_000

const hexColorSchema = z.string().trim().regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Expected a hex color')
const optionalHexColorSchema = z.union([hexColorSchema, z.null()])

const paletteScaleSchema = z.object({
  '50': optionalHexColorSchema,
  '100': optionalHexColorSchema,
  '200': optionalHexColorSchema,
  '300': optionalHexColorSchema,
  '400': optionalHexColorSchema,
  '500': optionalHexColorSchema,
  '600': optionalHexColorSchema,
  '700': optionalHexColorSchema,
  '800': optionalHexColorSchema,
  '900': optionalHexColorSchema,
  '950': optionalHexColorSchema,
})

const aiFixSchema = z.object({
  token: z.string().trim().min(1),
  mode: z.enum(['light', 'dark', 'shared']),
  currentValue: z.string().trim().min(1).nullable().optional(),
  suggestedValue: z.string().trim().min(1),
  reason: z.string().trim().min(1),
})

export const paletteGenerateRequestSchema = z.object({
  prompt: z.string().trim().min(1, 'Prompt is required.').max(AI_PROMPT_MAX_LENGTH),
  brandColors: z.array(hexColorSchema).min(1).max(6).optional(),
  referenceSummary: z.string().trim().min(1).max(AI_REFERENCE_SUMMARY_MAX_LENGTH).optional(),
  referenceImage: z.object({
    data: z.string().trim().min(1).max(AI_REFERENCE_IMAGE_DATA_MAX_LENGTH, 'Reference image is too large.'),
    mimeType: z.string().trim().regex(/^image\/(?:png|jpeg|webp)$/, 'Expected a PNG, JPEG, or WebP image'),
  }).optional(),
})

export const paletteRampGenerateRequestSchema = z.object({
  paletteName: z.string().trim().min(1).max(120).optional(),
  brandColors: z.array(hexColorSchema).min(1).max(6, 'Use up to 6 brand colors.'),
  prompt: z.string().trim().min(1).max(AI_PROMPT_MAX_LENGTH).optional(),
})

export const paletteRampGenerateResponseSchema = z.object({
  paletteName: z.string().trim().min(1),
  ramps: z.record(z.string().trim().min(1), paletteScaleSchema),
})

export const paletteVariantGenerateRequestSchema = z.object({
  prompt: z.string().trim().min(1, 'Prompt is required.').max(AI_PROMPT_MAX_LENGTH),
  palette: paletteDefinitionSchema.optional(),
  componentKeys: z.array(z.string().trim().min(1)).min(1).max(8).optional(),
})

export const paletteVariantGenerateResponseSchema = z.object({
  summary: z.string().trim().min(1),
  components: paletteDefinitionSchema.shape.components.unwrap(),
})

export const paletteAuditGenerateRequestSchema = z.object({
  palette: paletteDefinitionSchema,
})

export const paletteAuditGenerateResponseSchema = z.object({
  summary: z.string().trim().min(1),
  fixes: z.array(aiFixSchema).min(1),
  patchedPalette: paletteDefinitionSchema,
})

const stringResponseSchema = {
  type: 'string',
} as const

function createObjectResponseSchema<T extends Record<string, unknown>>(properties: T) {
  return {
    type: 'object',
    properties,
    required: Object.keys(properties),
  } as const
}

export const paletteAuditResponseSchema = createObjectResponseSchema({
  summary: stringResponseSchema,
  fixes: {
    type: 'array',
    items: createObjectResponseSchema({
      token: stringResponseSchema,
      mode: {
        type: 'string',
        enum: ['light', 'dark', 'shared'],
      },
      currentValue: stringResponseSchema,
      suggestedValue: stringResponseSchema,
      reason: stringResponseSchema,
    }),
  },
  patchedPalette: paletteResponseSchema,
})

export const paletteDirectionsGenerateRequestSchema = z.object({
  palette: paletteDefinitionSchema,
  prompt: z.string().trim().min(1).max(AI_PROMPT_MAX_LENGTH).optional(),
  count: z.number().int().min(1).max(3).optional(),
})

export const paletteDirectionsGenerateResponseSchema = z.object({
  directions: z.array(z.object({
    name: z.string().trim().min(1),
    rationale: z.string().trim().min(1),
    palette: paletteDefinitionSchema,
  })).min(1).max(3),
})
