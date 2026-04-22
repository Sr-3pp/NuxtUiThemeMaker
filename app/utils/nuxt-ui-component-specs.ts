export const nuxtUiSemanticColorKeys = [
  'primary',
  'secondary',
  'neutral',
  'success',
  'info',
  'warning',
  'error',
] as const

export interface NuxtUiColorVariantComponentSpec {
  key: string
  label: string
  variants: string[]
  colors: string[]
}

export const nuxtUiColorVariantComponentSpecs: Record<string, NuxtUiColorVariantComponentSpec> = {
  button: {
    key: 'button',
    label: 'Button',
    variants: ['solid', 'outline', 'soft', 'subtle', 'ghost', 'link'],
    colors: [...nuxtUiSemanticColorKeys],
  },
  badge: {
    key: 'badge',
    label: 'Badge',
    variants: ['solid', 'outline', 'soft', 'subtle'],
    colors: [...nuxtUiSemanticColorKeys],
  },
  alert: {
    key: 'alert',
    label: 'Alert',
    variants: ['solid', 'outline', 'soft', 'subtle'],
    colors: [...nuxtUiSemanticColorKeys],
  },
}

export const nuxtUiColorVariantComponentKeys = ['button', 'badge', 'alert'] as const

export function isNuxtUiColorVariantComponentKey(value: string): value is keyof typeof nuxtUiColorVariantComponentSpecs {
  return value in nuxtUiColorVariantComponentSpecs
}
