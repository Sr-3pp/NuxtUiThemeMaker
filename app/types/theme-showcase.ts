import type { AlertProps, ButtonProps, CardProps } from '@nuxt/ui'

export type SemanticColorName =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'

export type ExtendedSemanticColorName = SemanticColorName | 'neutral'

export interface SemanticColorItem {
  name: SemanticColorName
  bg: string
  text: string
  border: string
  invertedText: string
}

export interface UtilityFamilyItem {
  family: string
  classes: string
  count: number
}

export interface ShowcaseTabItem {
  label: string
  value: string
  slot: string
}

export interface ComponentMatrixItem {
  component: string
  coverage: string
  surface: string
}

export interface ContentItem {
  label: string
  content: string
  value: string
  slot?: string
}

export interface SelectItem {
  label: string
  value: string
  description: string
}

export interface ChoiceItem {
  label: string
  value: string
  description: string
}

export interface SurfaceModeItem {
  label: string
  token: string
}

export type ButtonVariant = NonNullable<ButtonProps['variant']>
export type AlertVariant = NonNullable<AlertProps['variant']>
export type CardVariant = NonNullable<CardProps['variant']>
