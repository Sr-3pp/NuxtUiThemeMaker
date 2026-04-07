import type { AlertProps, ButtonProps, CardProps } from '@nuxt/ui'
import type { PaletteDefinition } from '~/types/palette'

export interface PreviewInteractiveProps {
  disableInteractive: boolean
  palette?: PaletteDefinition | null
}

export interface PreviewPanelContentProps extends PreviewInteractiveProps {
  inspectTokens?: boolean
}

export type ButtonColor = NonNullable<ButtonProps['color']>
export type ButtonVariant = NonNullable<ButtonProps['variant']>
export type AlertVariant = NonNullable<AlertProps['variant']>
export type CardVariant = NonNullable<CardProps['variant']>
export type PreviewTabValue = 'browser' | 'components' | 'forms' | 'surfaces' | 'typography'
export type PreviewFrameMode = 'current' | 'light' | 'dark' | 'split'
export type PreviewViewport = 'mobile' | 'tablet' | 'desktop' | 'full'
