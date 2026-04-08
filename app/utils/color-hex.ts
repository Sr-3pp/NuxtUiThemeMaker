export interface HexRgbColor {
  r: number
  g: number
  b: number
}

function clampChannel(value: number) {
  return Math.min(255, Math.max(0, Math.round(value)))
}

export function normalizeHexColor(value: string | null | undefined) {
  const normalized = value?.trim()

  if (!normalized) {
    return null
  }

  const match = normalized.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)

  if (!match?.[1]) {
    return null
  }

  const hex = match[1]

  if (hex.length === 3) {
    return `#${hex.split('').map(char => `${char}${char}`).join('').toLowerCase()}`
  }

  return `#${hex.toLowerCase()}`
}

export function parseHexColor(value: string | null | undefined): HexRgbColor | null {
  const normalized = normalizeHexColor(value)

  if (!normalized) {
    return null
  }

  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
  }
}

export function toHexColor(color: HexRgbColor) {
  return `#${[color.r, color.g, color.b].map(channel => clampChannel(channel).toString(16).padStart(2, '0')).join('')}`
}
