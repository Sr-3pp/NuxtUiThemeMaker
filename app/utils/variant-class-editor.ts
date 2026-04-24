import type { PaletteTokenGroup } from '~/types/palette'

export type FlatVariantClassFieldKey =
  | 'bg'
  | 'text'
  | 'border'
  | 'ring'
  | 'hoverBg'
  | 'hoverText'
  | 'activeBg'
  | 'activeText'
  | 'focusRing'
  | 'extras'

export interface FlatVariantClassFields {
  bg: string | null
  text: string | null
  border: string | null
  ring: string | null
  hoverBg: string | null
  hoverText: string | null
  activeBg: string | null
  activeText: string | null
  focusRing: string | null
  extras: string | null
}

export const flatVariantClassFieldKeys: FlatVariantClassFieldKey[] = [
  'bg',
  'text',
  'border',
  'ring',
  'hoverBg',
  'hoverText',
  'activeBg',
  'activeText',
  'focusRing',
  'extras',
]

const orderedFieldDefinitions: Array<{ key: Exclude<FlatVariantClassFieldKey, 'extras'>, prefix: string }> = [
  { key: 'text', prefix: 'text-' },
  { key: 'bg', prefix: 'bg-' },
  { key: 'border', prefix: 'border-' },
  { key: 'ring', prefix: 'ring-' },
  { key: 'hoverText', prefix: 'hover:text-' },
  { key: 'hoverBg', prefix: 'hover:bg-' },
  { key: 'activeText', prefix: 'active:text-' },
  { key: 'activeBg', prefix: 'active:bg-' },
  { key: 'focusRing', prefix: 'focus-visible:ring-' },
]

const semanticColorKeys = new Set(['primary', 'secondary', 'neutral', 'success', 'info', 'warning', 'error'])

function normalizeValue(value: string | null | undefined) {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

function mapCssVariableToUtility(
  value: string,
  utility: 'bg' | 'text' | 'border' | 'ring',
) {
  const normalized = value.trim()

  if (utility === 'bg') {
    if (normalized === 'var(--ui-bg)') return 'bg-default'
    if (normalized.startsWith('var(--ui-bg-')) return `bg-${normalized.replace(/^var\(--ui-bg-/, '').replace(/\)$/, '')}`
    if (normalized.startsWith('var(--ui-')) {
      const tokenKey = normalized.replace(/^var\(--ui-/, '').replace(/\)$/, '')
      if (semanticColorKeys.has(tokenKey)) return `bg-${tokenKey}`
    }
  }

  if (utility === 'text') {
    if (normalized === 'var(--ui-text)') return 'text-default'
    if (normalized.startsWith('var(--ui-text-')) return `text-${normalized.replace(/^var\(--ui-text-/, '').replace(/\)$/, '')}`
    if (normalized.startsWith('var(--ui-')) {
      const tokenKey = normalized.replace(/^var\(--ui-/, '').replace(/\)$/, '')
      if (semanticColorKeys.has(tokenKey)) return `text-${tokenKey}`
    }
  }

  if (utility === 'border') {
    if (normalized === 'var(--ui-border)') return 'border-border'
    if (normalized === 'var(--ui-border-muted)') return 'border-border-muted'
    if (normalized === 'var(--ui-border-accented)') return 'border-border-accented'
    if (normalized.startsWith('var(--ui-')) {
      const tokenKey = normalized.replace(/^var\(--ui-/, '').replace(/\)$/, '')
      if (semanticColorKeys.has(tokenKey)) return `border-${tokenKey}`
    }
  }

  if (utility === 'ring') {
    if (normalized === 'var(--ui-ring)') return 'ring-ring'
    if (normalized.startsWith('var(--ui-')) {
      const tokenKey = normalized.replace(/^var\(--ui-/, '').replace(/\)$/, '')
      if (semanticColorKeys.has(tokenKey)) return `ring-${tokenKey}`
    }
  }

  return null
}

function normalizeStructuredFieldValue(
  fieldKey: FlatVariantClassFieldKey,
  value: string | null | undefined,
) {
  const normalized = normalizeValue(value)

  if (!normalized || fieldKey === 'extras') {
    return normalized
  }

  if (
    normalized.startsWith('bg-')
    || normalized.startsWith('text-')
    || normalized.startsWith('border-')
    || normalized.startsWith('ring-')
    || normalized.startsWith('hover:bg-')
    || normalized.startsWith('hover:text-')
    || normalized.startsWith('active:bg-')
    || normalized.startsWith('active:text-')
    || normalized.startsWith('focus-visible:ring-')
  ) {
    return normalized
  }

  if (fieldKey === 'bg') return mapCssVariableToUtility(normalized, 'bg')
  if (fieldKey === 'text') return mapCssVariableToUtility(normalized, 'text')
  if (fieldKey === 'border') return mapCssVariableToUtility(normalized, 'border')
  if (fieldKey === 'ring' || fieldKey === 'focusRing') return mapCssVariableToUtility(normalized, 'ring')
  if (fieldKey === 'hoverBg' && normalized.startsWith('var(')) {
    const mapped = mapCssVariableToUtility(normalized, 'bg')
    return mapped ? `hover:${mapped}` : null
  }
  if (fieldKey === 'hoverText' && normalized.startsWith('var(')) {
    const mapped = mapCssVariableToUtility(normalized, 'text')
    return mapped ? `hover:${mapped}` : null
  }
  if (fieldKey === 'activeBg' && normalized.startsWith('var(')) {
    const mapped = mapCssVariableToUtility(normalized, 'bg')
    return mapped ? `active:${mapped}` : null
  }
  if (fieldKey === 'activeText' && normalized.startsWith('var(')) {
    const mapped = mapCssVariableToUtility(normalized, 'text')
    return mapped ? `active:${mapped}` : null
  }

  return normalized
}

export function createEmptyFlatVariantClassFields(): FlatVariantClassFields {
  return {
    bg: null,
    text: null,
    border: null,
    ring: null,
    hoverBg: null,
    hoverText: null,
    activeBg: null,
    activeText: null,
    focusRing: null,
    extras: null,
  }
}

export function isFlatVariantClassFieldKey(value: string): value is FlatVariantClassFieldKey {
  return flatVariantClassFieldKeys.includes(value as FlatVariantClassFieldKey)
}

export function parseFlatVariantClassString(value: string | null | undefined): FlatVariantClassFields {
  const fields = createEmptyFlatVariantClassFields()
  const extras: string[] = []

  for (const className of (value ?? '').trim().split(/\s+/).filter(Boolean)) {
    const matchingField = orderedFieldDefinitions.find(field => className.startsWith(field.prefix))

    if (!matchingField) {
      extras.push(className)
      continue
    }

    fields[matchingField.key] = className
  }

  fields.extras = extras.length > 0 ? extras.join(' ') : null

  return fields
}

export function buildFlatVariantClassString(fields: FlatVariantClassFields) {
  return [
    fields.text,
    fields.bg,
    fields.border,
    fields.ring,
    fields.hoverText,
    fields.hoverBg,
    fields.activeText,
    fields.activeBg,
    fields.focusRing,
    fields.extras,
  ].filter(Boolean).join(' ')
}

export function toFlatVariantClassFields(
  value: string | PaletteTokenGroup | null | undefined,
): FlatVariantClassFields {
  if (!value) {
    return createEmptyFlatVariantClassFields()
  }

  if (typeof value === 'string') {
    return parseFlatVariantClassString(value)
  }

  const fields = createEmptyFlatVariantClassFields()

  if (typeof value.class === 'string') {
    Object.assign(fields, parseFlatVariantClassString(value.class))
  }

  for (const [key, rawValue] of Object.entries(value)) {
    if (!isFlatVariantClassFieldKey(key)) {
      continue
    }

    fields[key] = normalizeStructuredFieldValue(key, rawValue)
  }

  return fields
}

export function isStructuredFlatVariantFields(value: string | PaletteTokenGroup | null | undefined) {
  if (!value || typeof value === 'string') {
    return false
  }

  return Object.entries(value).some(([key, rawValue]) => {
    if (!isFlatVariantClassFieldKey(key) || typeof rawValue !== 'string') {
      return false
    }

    if (['hoverBg', 'hoverText', 'activeBg', 'activeText', 'focusRing', 'extras'].includes(key)) {
      return true
    }

    return rawValue.startsWith('bg-')
      || rawValue.startsWith('text-')
      || rawValue.startsWith('border-')
      || rawValue.startsWith('ring-')
  })
}

export function normalizeStructuredFlatVariantValue(
  value: string | PaletteTokenGroup | null | undefined,
) {
  const fields = toFlatVariantClassFields(value)

  return Object.fromEntries(
    flatVariantClassFieldKeys
      .map(key => [key, fields[key]] as const)
      .filter(([, fieldValue]) => fieldValue != null)
  ) as PaletteTokenGroup
}
