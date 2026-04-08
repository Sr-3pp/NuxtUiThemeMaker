import type { PaletteDefinition } from '~/types/palette'

export type PaletteLifecycleStatus = 'draft' | 'published'
export type PaletteVersionEvent = 'created' | 'updated' | 'published' | 'unpublished'

export interface PaletteVersionSnapshot {
  id: string
  paletteId: string
  version: number
  name: string
  palette: PaletteDefinition
  lifecycleStatus: PaletteLifecycleStatus
  isPublic: boolean
  event: PaletteVersionEvent
  createdAt: string
}

export type PaletteComparisonChangeType = 'added' | 'removed' | 'changed'

export interface PaletteComparisonChange {
  path: string
  section: string
  type: PaletteComparisonChangeType
  before: string | null
  after: string | null
}

export interface PaletteComparisonReport {
  fromVersion: number
  toVersion: number
  totalChanges: number
  addedCount: number
  removedCount: number
  changedCount: number
  sectionCounts: Record<string, number>
  changes: PaletteComparisonChange[]
}
