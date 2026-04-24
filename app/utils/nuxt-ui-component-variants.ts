import type { PaletteComponentThemes } from '~/types/palette'
import { normalizeComponentThemes } from './palette-io'
import {
  buildFlatVariantClassString,
  normalizeStructuredFlatVariantValue,
  toFlatVariantClassFields,
} from './variant-class-editor'

const colorVariantSlotMap: Record<string, string | null> = {
  button: null,
  badge: null,
  alert: 'root',
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function normalizeVariantLeafForEditing(value: unknown) {
  if (typeof value !== 'string' && !isRecord(value)) {
    return value
  }

  return normalizeStructuredFlatVariantValue(value)
}

function createRuntimeCompoundVariants(componentKey: string, section: Record<string, unknown>) {
  const slotKey = colorVariantSlotMap[componentKey]
  const configuredVariants = isRecord(section.variants) ? section.variants : null

  if (!configuredVariants) {
    return null
  }

  const generatedCompoundVariants = Object.entries(configuredVariants).flatMap(([variant, colors]) => {
    if (!isRecord(colors)) {
      return []
    }

    return Object.entries(colors).flatMap(([color, value]) => {
      if (typeof value !== 'string' && !isRecord(value)) {
        return []
      }

      const classValue = buildFlatVariantClassString(toFlatVariantClassFields(value))

      if (!classValue) {
        return []
      }

      return [{
        variant,
        color,
        class: slotKey ? { [slotKey]: classValue } : classValue,
      }]
    })
  })

  return generatedCompoundVariants.length > 0 ? generatedCompoundVariants : null
}

export function normalizeEditableComponentThemes(components?: PaletteComponentThemes) {
  if (!components) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(components).map(([componentKey, section]) => {
      if (!section || !(componentKey in colorVariantSlotMap) || !section.variants) {
        return [componentKey, JSON.parse(JSON.stringify(section ?? {}))]
      }

      const nextVariants = Object.fromEntries(
        Object.entries(section.variants).map(([variant, colors]) => [variant, Object.fromEntries(
          Object.entries(colors ?? {}).map(([color, value]) => [color, normalizeVariantLeafForEditing(value)])
        )])
      )

      return [componentKey, {
        ...JSON.parse(JSON.stringify(section)),
        variants: nextVariants,
      }]
    })
  ) as PaletteComponentThemes
}

export function resolveNuxtUiComponentThemes(components?: PaletteComponentThemes) {
  const normalizedComponents = normalizeComponentThemes(components)

  return Object.fromEntries(
    Object.entries(normalizedComponents).map(([componentKey, value]) => {
      if (!isRecord(value) || !(componentKey in colorVariantSlotMap)) {
        return [componentKey, value]
      }

      const normalizedVariants = isRecord(value.variants)
        ? Object.fromEntries(
          Object.entries(value.variants).map(([variant, colors]) => [variant, isRecord(colors)
            ? Object.fromEntries(
              Object.entries(colors).map(([color, leafValue]) => {
                if (typeof leafValue !== 'string' && !isRecord(leafValue)) {
                  return [color, leafValue]
                }

                const classValue = buildFlatVariantClassString(toFlatVariantClassFields(leafValue))
                return [color, classValue || leafValue]
              })
            )
            : colors])
        )
        : value.variants

      const normalizedValue = {
        ...value,
        variants: normalizedVariants,
      }

      const generatedCompoundVariants = createRuntimeCompoundVariants(componentKey, normalizedValue)

      if (!generatedCompoundVariants) {
        return [componentKey, normalizedValue]
      }

      const existingCompoundVariants = Array.isArray(normalizedValue.compoundVariants)
        ? normalizedValue.compoundVariants
        : []

      return [componentKey, {
        ...normalizedValue,
        compoundVariants: [...existingCompoundVariants, ...generatedCompoundVariants],
      }]
    })
  ) as PaletteComponentThemes
}
