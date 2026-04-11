import { z } from 'zod'

export const paletteShareSchema = z.object({
  email: z.email('A valid email is required'),
})
