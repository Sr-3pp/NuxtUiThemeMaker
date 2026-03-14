import type { PaletteDefinition, PaletteModeKey } from '~/types/palette'

export type EditorTab = 'tokens' | 'export'
export type ExportItemValue = 'css' | 'appConfig' | 'ts'

interface UpdatePaletteTokenPayload {
  mode: PaletteModeKey
  section: string
  token: string
  value: string | null
}

export interface ThemeWorkbenchEditorProps {
  palette: PaletteDefinition
  sourcePalette: PaletteDefinition
  isWorking?: boolean
  defaultMode?: PaletteModeKey
  tab: EditorTab
}

export interface ThemeWorkbenchEditorEmits {
  save: []
  saveAsNew: []
  'update-token': [payload: UpdatePaletteTokenPayload]
  'update:tab': [value: EditorTab]
}

type ThemeValue = string | null
type ThemeSection = Record<string, ThemeValue>

export type ThemeSchema = Record<string, ThemeValue | ThemeSection>
