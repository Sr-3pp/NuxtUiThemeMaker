import type { CSSProperties } from 'vue'
import type { PaletteDefinition, PaletteModeKey, PaletteTokenGroup } from '~/types/palette'
import { buildFlatVariantClassString, isStructuredFlatVariantFields, toFlatVariantClassFields } from './variant-class-editor'

/**
 * Normalize component theme value to object form
 */
function normalizeToTokenGroup(value: string | PaletteTokenGroup | undefined): PaletteTokenGroup | undefined {
  if (!value) return undefined
  if (typeof value === 'string') return { class: value }
  return value
}

function normalizeTokenValue(value: string | null | undefined) {
  const normalized = value?.trim()
  return normalized ? normalized : undefined
}

function buildStyleFromTokens(tokens?: PaletteTokenGroup): CSSProperties | undefined {
  if (!tokens) {
    return undefined
  }

  const backgroundColor = normalizeTokenValue(tokens.bg)
  const color = normalizeTokenValue(tokens.text)
  const borderColor = normalizeTokenValue(tokens.border)
  const ring = normalizeTokenValue(tokens.ring)

  const style: CSSProperties = {}

  if (backgroundColor) {
    style.backgroundColor = backgroundColor
  }

  if (color) {
    style.color = color
  }

  if (borderColor) {
    style.borderColor = borderColor
    style.borderWidth = '1px'
    style.borderStyle = 'solid'
  }

  if (ring) {
    style.boxShadow = `0 0 0 1px ${ring}`
  }

  return Object.keys(style).length > 0 ? style : undefined
}

function applyOpacity(value: string, opacitySuffix?: string) {
  if (!opacitySuffix) {
    return value
  }

  const percent = Number.parseInt(opacitySuffix, 10)

  if (!Number.isFinite(percent)) {
    return value
  }

  return `color-mix(in srgb, ${value} ${percent}%, transparent)`
}

function resolveFlatClassColorValue(
  palette: PaletteDefinition | null | undefined,
  mode: PaletteModeKey,
  utility: 'bg' | 'text' | 'border' | 'ring',
  className: string | null | undefined,
) {
  const normalized = className?.trim()

  if (!normalized) {
    return undefined
  }

  const prefix = utility === 'ring' && normalized.startsWith('focus-visible:ring-')
    ? 'focus-visible:ring-'
    : `${utility}-`

  if (!normalized.startsWith(prefix)) {
    return undefined
  }

  const rawValue = normalized.slice(prefix.length)
  const [tokenKey, opacitySuffix] = rawValue.split('/')
  const modeTokens = palette?.modes?.[mode]

  const resolvedBaseValue = utility === 'bg'
    ? modeTokens?.bg?.[tokenKey] ?? modeTokens?.color?.[tokenKey]
    : utility === 'text'
      ? modeTokens?.text?.[tokenKey] ?? modeTokens?.color?.[tokenKey]
      : modeTokens?.ui?.[tokenKey] ?? modeTokens?.color?.[tokenKey]

  return resolvedBaseValue ? applyOpacity(resolvedBaseValue, opacitySuffix) : undefined
}

function buildStyleFromFlatClassString(
  palette: PaletteDefinition | null | undefined,
  mode: PaletteModeKey,
  classValue: string | PaletteTokenGroup,
) {
  const fields = toFlatVariantClassFields(classValue)
  const style: CSSProperties = {}

  const backgroundColor = resolveFlatClassColorValue(palette, mode, 'bg', fields.bg)
  const color = resolveFlatClassColorValue(palette, mode, 'text', fields.text)
  const borderColor = resolveFlatClassColorValue(palette, mode, 'border', fields.border)
  const ringColor = resolveFlatClassColorValue(palette, mode, 'ring', fields.ring)

  if (backgroundColor) {
    style.backgroundColor = backgroundColor
  }

  if (color) {
    style.color = color
  }

  if (borderColor) {
    style.borderColor = borderColor
    style.borderWidth = '1px'
    style.borderStyle = 'solid'
  }

  if (ringColor) {
    style.boxShadow = `0 0 0 1px ${ringColor}`
  }

  return Object.keys(style).length > 0 ? style : undefined
}

export function getPreviewButtonStyle(
  palette: PaletteDefinition | null | undefined,
  variant: string,
  color: string
) {
  return getPreviewVariantStyle(palette, 'button', variant, color)
}

export function getPreviewVariantStyle(
  palette: PaletteDefinition | null | undefined,
  component: string,
  variant: string,
  color: string,
  options?: {
    mode?: PaletteModeKey
  },
) {
  const variantValue = palette?.components?.[component]?.variants?.[variant]?.[color]

  if (typeof variantValue === 'string') {
    return buildStyleFromFlatClassString(palette, options?.mode ?? 'light', variantValue)
  }

  if (isStructuredFlatVariantFields(variantValue)) {
    return buildStyleFromFlatClassString(palette, options?.mode ?? 'light', variantValue)
  }

  return buildStyleFromTokens(normalizeToTokenGroup(variantValue))
}

export function getPreviewVariantClass(
  palette: PaletteDefinition | null | undefined,
  component: string,
  variant: string,
  color: string,
) {
  const variantValue = palette?.components?.[component]?.variants?.[variant]?.[color]

  if (typeof variantValue === 'string') {
    return variantValue
  }

  if (isStructuredFlatVariantFields(variantValue)) {
    return buildFlatVariantClassString(toFlatVariantClassFields(variantValue))
  }

  const normalizedValue = normalizeToTokenGroup(variantValue)

  return typeof normalizedValue?.class === 'string' ? normalizedValue.class : undefined
}

export function getPreviewInputStyle(palette: PaletteDefinition | null | undefined) {
  return buildStyleFromTokens(
    normalizeToTokenGroup(palette?.components?.input?.base)
  )
}
