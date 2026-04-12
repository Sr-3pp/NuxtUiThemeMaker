import { z } from 'zod'
const paletteTokenValueSchema = z.union([z.string().trim().min(1), z.null()])
const paletteTokenGroupSchema = z.record(z.string(), paletteTokenValueSchema)
const paletteModeSchema = z.record(z.string(), paletteTokenGroupSchema)
const jsonValueSchema: z.ZodType<unknown> = z.lazy(() => z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(jsonValueSchema),
  z.record(z.string(), jsonValueSchema),
]))
const paletteColorScaleSchema = z.object({
  '50': paletteTokenValueSchema,
  '100': paletteTokenValueSchema,
  '200': paletteTokenValueSchema,
  '300': paletteTokenValueSchema,
  '400': paletteTokenValueSchema,
  '500': paletteTokenValueSchema,
  '600': paletteTokenValueSchema,
  '700': paletteTokenValueSchema,
  '800': paletteTokenValueSchema,
  '900': paletteTokenValueSchema,
  '950': paletteTokenValueSchema,
})
const paletteComponentThemeSectionSchema = z.object({
  base: paletteTokenGroupSchema.optional(),
  slots: z.record(z.string(), paletteTokenGroupSchema).optional(),
  variants: z.record(z.string(), z.record(z.string(), paletteTokenGroupSchema)).optional(),
  states: z.record(z.string(), paletteTokenGroupSchema).optional(),
})
const paletteUiSchema = z.record(z.string(), jsonValueSchema)

export const paletteDefinitionSchema = z.object({
  name: z.string().trim().min(1, 'Palette name is required'),
  modes: z.object({
    light: paletteModeSchema,
    dark: paletteModeSchema
  }),
  colors: z.record(z.string(), paletteColorScaleSchema).optional(),
  aliases: z.record(z.string(), z.union([z.string().trim().min(1), z.null()])).optional(),
  components: z.record(z.string(), paletteComponentThemeSectionSchema).optional(),
  ui: paletteUiSchema.optional(),
  metadata: z.object({
    version: z.number().int().min(1),
    normalizedAt: z.string().datetime().nullish(),
  }).optional(),
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

const paletteTokenGroupsResponseSchema = createObjectResponseSchema({
  color: createObjectResponseSchema({
    primary: stringResponseSchema,
    secondary: stringResponseSchema,
    success: stringResponseSchema,
    info: stringResponseSchema,
    warning: stringResponseSchema,
    error: stringResponseSchema,
  }),
  text: createObjectResponseSchema({
    default: stringResponseSchema,
    dimmed: stringResponseSchema,
    muted: stringResponseSchema,
    toned: stringResponseSchema,
    highlighted: stringResponseSchema,
    inverted: stringResponseSchema,
  }),
  bg: createObjectResponseSchema({
    default: stringResponseSchema,
    muted: stringResponseSchema,
    elevated: stringResponseSchema,
    accented: stringResponseSchema,
    inverted: stringResponseSchema,
  }),
  ui: createObjectResponseSchema({
    border: stringResponseSchema,
    'border-muted': stringResponseSchema,
    'border-accented': stringResponseSchema,
    ring: stringResponseSchema,
  }),
  radius: createObjectResponseSchema({
    default: stringResponseSchema,
    sm: stringResponseSchema,
    md: stringResponseSchema,
    lg: stringResponseSchema,
    xl: stringResponseSchema,
  }),
})

export const paletteResponseSchema = createObjectResponseSchema({
  name: stringResponseSchema,
  modes: createObjectResponseSchema({
    light: paletteTokenGroupsResponseSchema,
    dark: paletteTokenGroupsResponseSchema,
  }),
})

export const paletteGenerateResultSchema = z.object({
  palette: paletteDefinitionSchema,
  ui: paletteUiSchema,
})

export const paletteGenerateResultResponseSchema = createObjectResponseSchema({
  palette: paletteResponseSchema,
  ui: {
    type: 'object',
  },
})

export const paletteWriteSchema = z.object({
  name: z.string().trim().min(1, 'Palette name is required'),
  palette: paletteDefinitionSchema,
  isPublic: z.boolean().optional(),
})

export const paletteVisibilitySchema = z.object({
  isPublic: z.boolean(),
})
