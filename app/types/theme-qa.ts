import type { PaletteModeKey } from '~/types/palette'

export type ThemeQaSeverity = 'critical' | 'warning' | 'info'
export type ThemeQaCategory = 'contrast' | 'semantic' | 'focus' | 'component' | 'readiness'
export type ThemeQaStatus = 'healthy' | 'needs-work' | 'risky'

export interface ThemeQaIssue {
  id: string
  category: ThemeQaCategory
  severity: ThemeQaSeverity
  mode: PaletteModeKey | 'shared'
  title: string
  description: string
  tokens: string[]
  actual?: number
  minimum?: number
}

export interface ThemeQaReadinessItem {
  id: string
  label: string
  passed: boolean
  description: string
}

export interface ThemeQaReport {
  score: number
  status: ThemeQaStatus
  issues: ThemeQaIssue[]
  readiness: ThemeQaReadinessItem[]
  counts: Record<ThemeQaSeverity, number>
}

export interface StoredPaletteQaReport {
  paletteId: string
  report: ThemeQaReport
}

export interface ThemeQaPanelProps {
  palette: import('~/types/palette').PaletteDefinition | import('~/types/palette-editor').EditablePalette | null
  compact?: boolean
  report?: ThemeQaReport | null
  source?: 'local' | 'server'
  loading?: boolean
}

export interface ThemeQaStatusMeta {
  color: 'success' | 'warning' | 'error'
  label: string
  description: string
}
