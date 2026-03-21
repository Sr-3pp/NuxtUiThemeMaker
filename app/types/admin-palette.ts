export interface AdminPaletteListItem {
  id: string
  userId: string
  slug: string
  name: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface AdminPaletteUpdateInput {
  name: string
  isPublic: boolean
}
