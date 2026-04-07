import type { PaletteDefinition, PaletteModeKey } from '~/types/palette'
import type {
  UpdateEditablePaletteColorScalePayload,
  UpdateEditablePaletteComponentTokenPayload,
} from '~/types/palette-editor'

export type EditorTab = 'tokens' | 'export'
export type ExportItemValue = 'css' | 'appConfig' | 'ts'

export interface UpdatePaletteTokenPayload {
  mode: PaletteModeKey
  section: string
  token: string
  value: string | null
}

export type UpdatePaletteColorScalePayload = UpdateEditablePaletteColorScalePayload
export type UpdatePaletteComponentTokenPayload = UpdateEditablePaletteComponentTokenPayload

export interface WorkbenchEditorProps {
  palette: PaletteDefinition
  sourcePalette: PaletteDefinition
  isWorking?: boolean
  defaultMode?: PaletteModeKey
  tab: EditorTab
}

export interface WorkbenchEditorEmits {
  save: []
  saveAsNew: []
  'update-token': [payload: UpdatePaletteTokenPayload]
  'update-color-scale': [payload: UpdatePaletteColorScalePayload]
  'update-component-token': [payload: UpdatePaletteComponentTokenPayload]
  'update:tab': [value: EditorTab]
}

type ThemeValue = string | null
type ThemeSection = Record<string, ThemeValue>

export type ThemeSchema = Record<string, ThemeValue | ThemeSection>
