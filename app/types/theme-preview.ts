import type { AlertProps } from '@nuxt/ui/components/Alert.vue'
import type { BadgeProps } from '@nuxt/ui/components/Badge.vue'
import type { ButtonProps } from '@nuxt/ui/components/Button.vue'
import type { CardProps } from '@nuxt/ui/components/Card.vue'
import type { PaletteDefinition } from '~/types/palette'

export interface PreviewInteractiveProps {
  disableInteractive: boolean
  palette?: PaletteDefinition | null
}

export interface PreviewPanelContentProps extends PreviewInteractiveProps {}

export type ButtonColor = NonNullable<ButtonProps['color']>
export type ButtonVariant = NonNullable<ButtonProps['variant']>
export type BadgeVariant = NonNullable<BadgeProps['variant']>
export type AlertVariant = NonNullable<AlertProps['variant']>
export type CardVariant = NonNullable<CardProps['variant']>
export interface ButtonStateSample {
  label: string
  tone: ButtonColor
  disabled?: boolean
}

export interface FieldStateSample {
  label: string
  hint: string
  color: ButtonColor
  variant: 'outline'
  value: string
  placeholder: string
  highlight?: boolean
  focused?: boolean
  disabled?: boolean
}

export interface ButtonStateRow {
  color: ButtonColor
  variant: ButtonVariant
}

export interface BadgeStateSample {
  label: string
  color: ButtonColor
  variant: BadgeVariant
}

export interface AlertStateSample {
  label: string
  color: ButtonColor
  variant: AlertVariant
  description: string
}
