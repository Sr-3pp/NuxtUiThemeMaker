import { z } from 'zod'
import { paletteDefinitionSchema } from '~~/server/domain/palette-schema'

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
  prompt: z.string().trim().min(1, 'Prompt is required.'),
  brandColors: z.array(hexColorSchema).min(1).max(6).optional(),
  referenceSummary: z.string().trim().min(1).max(2500).optional(),
})

export const paletteRampGenerateRequestSchema = z.object({
  paletteName: z.string().trim().min(1).max(120).optional(),
  brandColors: z.array(hexColorSchema).min(1).max(6, 'Use up to 6 brand colors.'),
  prompt: z.string().trim().min(1).max(1500).optional(),
})

export const paletteRampGenerateResponseSchema = z.object({
  paletteName: z.string().trim().min(1),
  ramps: z.record(z.string().trim().min(1), paletteScaleSchema),
})

export const paletteVariantGenerateRequestSchema = z.object({
  prompt: z.string().trim().min(1, 'Prompt is required.'),
  palette: paletteDefinitionSchema.optional(),
  componentKeys: z.array(z.string().trim().min(1)).min(1).max(8).optional(),
})

export const paletteVariantGenerateResponseSchema = z.object({
  summary: z.string().trim().min(1),
  components: paletteDefinitionSchema.shape.components.unwrap(),
})

export const paletteAuditGenerateRequestSchema = z.object({
  palette: paletteDefinitionSchema,
  prompt: z.string().trim().min(1).max(1500).optional(),
})

export const paletteAuditGenerateResponseSchema = z.object({
  summary: z.string().trim().min(1),
  fixes: z.array(aiFixSchema).min(1),
  patchedPalette: paletteDefinitionSchema,
})

export const paletteDirectionsGenerateRequestSchema = z.object({
  palette: paletteDefinitionSchema,
  prompt: z.string().trim().min(1).max(1500).optional(),
  count: z.number().int().min(1).max(3).optional(),
})

export const paletteDirectionsGenerateResponseSchema = z.object({
  directions: z.array(z.object({
    name: z.string().trim().min(1),
    rationale: z.string().trim().min(1),
    palette: paletteDefinitionSchema,
  })).min(1).max(3),
})
