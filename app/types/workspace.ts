import type { PaletteReviewThread } from '~/types/palette-review'
import type { StoredPalette } from '~/types/palette-store'
import type { StoredPaletteQaReport } from '~/types/theme-qa'

export interface WorkspacePaletteItem {
  palette: StoredPalette
  reviewThread: PaletteReviewThread
  qa: StoredPaletteQaReport | null
}

export type WorkspaceRequestFetch = <T>(url: string, options?: {
  credentials?: RequestCredentials
}) => Promise<T>
