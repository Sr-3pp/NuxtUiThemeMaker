export type PaletteReviewStatus = 'commented' | 'approved' | 'changes_requested'

export interface PaletteReview {
  id: string
  paletteId: string
  userId: string
  userName: string
  status: PaletteReviewStatus
  message: string
  createdAt: string
}

export interface PaletteReviewSummary {
  total: number
  approvals: number
  comments: number
  changesRequested: number
}

export interface PaletteReviewThread {
  summary: PaletteReviewSummary
  reviews: PaletteReview[]
}

export interface CreatePaletteReviewPayload {
  status: PaletteReviewStatus
  message: string
}
