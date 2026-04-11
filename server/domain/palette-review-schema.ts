import { z } from 'zod'

export const paletteReviewWriteSchema = z.object({
  status: z.enum(['commented', 'approved', 'changes_requested']),
  message: z.string().trim().min(1, 'Review message is required').max(2000, 'Review message is too long'),
})
