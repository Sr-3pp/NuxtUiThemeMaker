import type { PaletteLifecycleStatus } from '~/types/palette-version'

export interface AdminPaletteListItem {
  id: string
  userId: string
  slug: string
  name: string
  isPublic: boolean
  lifecycleStatus: PaletteLifecycleStatus
  version: number
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface AdminPaletteUpdateInput {
  name: string
  isPublic: boolean
}
