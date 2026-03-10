import { z } from 'zod'

export const paletteDefinitionSchema = z.object({
  name: z.string().trim().min(1, 'Palette name is required'),
  modes: z.object({
    light: z.record(z.string(), z.record(z.string(), z.union([z.string().trim().min(1), z.null()]))),
    dark: z.record(z.string(), z.record(z.string(), z.union([z.string().trim().min(1), z.null()])))
  })
})

export const paletteWriteSchema = z.object({
  name: z.string().trim().min(1, 'Palette name is required'),
  palette: paletteDefinitionSchema,
  isPublic: z.boolean().optional(),
})

export const paletteVisibilitySchema = z.object({
  isPublic: z.boolean(),
})
