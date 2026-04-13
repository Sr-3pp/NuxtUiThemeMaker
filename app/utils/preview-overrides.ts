import type { CSSProperties } from 'vue'
import type { PaletteDefinition, PaletteTokenGroup } from '~/types/palette'

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

export function getPreviewButtonStyle(
  palette: PaletteDefinition | null | undefined,
  variant: string,
  color: string
) {
  return buildStyleFromTokens(
    normalizeToTokenGroup(palette?.components?.button?.variants?.[variant]?.[color])
  )
}

export function getPreviewInputStyle(palette: PaletteDefinition | null | undefined) {
  return buildStyleFromTokens(
    normalizeToTokenGroup(palette?.components?.input?.base)
  )
}
