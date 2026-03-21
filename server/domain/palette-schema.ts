import { z } from 'zod'

export const paletteDefinitionSchema = z.object({
  name: z.string().trim().min(1, 'Palette name is required'),
  modes: z.object({
    light: z.record(z.string(), z.record(z.string(), z.union([z.string().trim().min(1), z.null()]))),
    dark: z.record(z.string(), z.record(z.string(), z.union([z.string().trim().min(1), z.null()])))
  })
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

export const paletteWriteSchema = z.object({
  name: z.string().trim().min(1, 'Palette name is required'),
  palette: paletteDefinitionSchema,
  isPublic: z.boolean().optional(),
})

export const paletteVisibilitySchema = z.object({
  isPublic: z.boolean(),
})
