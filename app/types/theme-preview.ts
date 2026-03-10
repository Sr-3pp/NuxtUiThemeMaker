import type { AlertProps, ButtonProps, CardProps } from '@nuxt/ui'

export interface PreviewInteractiveProps {
  disableInteractive: boolean
}

export type ButtonColor = NonNullable<ButtonProps['color']>
export type ButtonVariant = NonNullable<ButtonProps['variant']>
export type AlertVariant = NonNullable<AlertProps['variant']>
export type CardVariant = NonNullable<CardProps['variant']>
