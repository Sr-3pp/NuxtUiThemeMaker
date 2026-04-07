import type { AlertProps, ButtonProps, CardProps } from '@nuxt/ui'
import type { PaletteDefinition } from '~/types/palette'

export interface PreviewInteractiveProps {
  disableInteractive: boolean
  palette?: PaletteDefinition | null
}

export type ButtonColor = NonNullable<ButtonProps['color']>
export type ButtonVariant = NonNullable<ButtonProps['variant']>
export type AlertVariant = NonNullable<AlertProps['variant']>
export type CardVariant = NonNullable<CardProps['variant']>
