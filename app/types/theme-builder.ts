import type { PaletteDefinition, PaletteModeKey } from '~/types/palette'

export type PreviewTab = 'components' | 'forms' | 'surfaces' | 'typography'
export type EditorTab = 'tokens' | 'export'
export type ExportItemValue = 'css' | 'appConfig' | 'ts'

export interface UpdatePaletteTokenPayload {
  mode: PaletteModeKey
  section: string
  token: string
  value: string | null
}

export interface ThemeWorkbenchEditorProps {
  palette: PaletteDefinition
  sourcePalette: PaletteDefinition
  defaultMode?: PaletteModeKey
  tab: EditorTab
}

export interface ThemeWorkbenchEditorEmits {
  'update-token': [payload: UpdatePaletteTokenPayload]
  'update:tab': [value: EditorTab]
}

export type ThemeValue = string | null
export type ThemeSection = Record<string, ThemeValue>
export type ThemeSchema = Record<string, ThemeValue | ThemeSection>
