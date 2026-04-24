import type { PaletteComponentThemeSection, PaletteComponentThemes, PaletteTokenGroup } from '../types/palette'

export type ComponentEditorArea = 'base' | 'slot' | 'variant' | 'state'

/**
 * Normalize a component theme value to PaletteTokenGroup.
 * Nuxt UI supports both flat strings ("rounded-lg px-4") and objects ({ bg: "...", text: "..." })
 */
function normalizeTokenGroup(value: string | PaletteTokenGroup | undefined): PaletteTokenGroup {
  if (!value) return {}
  if (typeof value === 'string') {
    return { class: value }
  }
  return value
}

/**
 * Get token keys from a value that can be either a string or token group object
 */
function getTokenKeys(value: string | PaletteTokenGroup | undefined): string[] {
  if (!value) return []
  if (typeof value === 'string') return ['class']
  return Object.keys(value)
}

export interface ComponentThemeEditorDefinition {
  value: string
  label: string
  areas: ComponentEditorArea[]
  slots: string[]
  variants: string[]
  variantColors: string[]
  tokenSuggestions: Record<ComponentEditorArea, string[]>
}

const defaultVariantColors = ['primary', 'secondary', 'neutral', 'success', 'info', 'warning', 'error']
const defaultStateNames = ['default', 'hover', 'active', 'focus', 'disabled']

function createTokenSuggestions(overrides?: Partial<Record<ComponentEditorArea, string[]>>) {
  return {
    base: ['bg', 'text', 'border', 'ring', 'shadow'],
    slot: ['bg', 'text', 'border', 'ring'],
    variant: ['bg', 'text', 'border', 'ring', 'shadow'],
    state: ['bg', 'text', 'border', 'ring', 'shadow', 'opacity'],
    ...overrides,
  } satisfies Record<ComponentEditorArea, string[]>
}

const defaultComponentDefinitions: ComponentThemeEditorDefinition[] = [
  {
    value: 'button',
    label: 'Button',
    areas: ['base', 'variant', 'state'],
    slots: [],
    variants: ['solid', 'outline', 'soft', 'subtle', 'ghost', 'link'],
    variantColors: defaultVariantColors,
    tokenSuggestions: createTokenSuggestions(),
  },
  {
    value: 'input',
    label: 'Input',
    areas: ['base', 'slot', 'state'],
    slots: ['leading', 'trailing'],
    variants: [],
    variantColors: defaultVariantColors,
    tokenSuggestions: createTokenSuggestions({
      slot: ['text', 'bg', 'border', 'ring'],
      state: ['bg', 'text', 'border', 'ring', 'placeholder'],
    }),
  },
  {
    value: 'badge',
    label: 'Badge',
    areas: ['base', 'variant', 'state'],
    slots: ['leading', 'trailing'],
    variants: ['solid', 'outline', 'soft', 'subtle'],
    variantColors: defaultVariantColors,
    tokenSuggestions: createTokenSuggestions({
      state: ['bg', 'text', 'border', 'ring', 'opacity'],
    }),
  },
  {
    value: 'alert',
    label: 'Alert',
    areas: ['base', 'slot', 'variant', 'state'],
    slots: ['icon', 'title', 'description', 'actions'],
    variants: ['solid', 'outline', 'soft', 'subtle'],
    variantColors: defaultVariantColors,
    tokenSuggestions: createTokenSuggestions({
      slot: ['bg', 'text', 'border'],
      state: ['bg', 'text', 'border', 'ring'],
    }),
  },
  {
    value: 'card',
    label: 'Card',
    areas: ['base', 'slot', 'state'],
    slots: ['header', 'body', 'footer'],
    variants: [],
    variantColors: defaultVariantColors,
    tokenSuggestions: createTokenSuggestions({
      base: ['bg', 'text', 'border', 'ring', 'shadow'],
      slot: ['bg', 'text', 'border'],
      state: ['bg', 'border', 'ring', 'shadow'],
    }),
  },
  {
    value: 'modal',
    label: 'Modal',
    areas: ['base', 'slot', 'state'],
    slots: ['overlay', 'content', 'header', 'body', 'footer'],
    variants: [],
    variantColors: defaultVariantColors,
    tokenSuggestions: createTokenSuggestions({
      slot: ['bg', 'text', 'border', 'ring'],
      state: ['bg', 'border', 'ring', 'shadow'],
    }),
  },
]

function formatEditorLabel(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\w/, char => char.toUpperCase())
}

function mergeUniqueValues(seed: string[], values: string[]) {
  return [...new Set([...seed, ...values.filter(Boolean)])]
}

function getDynamicDefinition(value: string, theme: PaletteComponentThemeSection): ComponentThemeEditorDefinition {
  const areas: ComponentEditorArea[] = []

  if (theme.base) {
    areas.push('base')
  }

  if (theme.slots && Object.keys(theme.slots).length > 0) {
    areas.push('slot')
  }

  if (theme.variants && Object.keys(theme.variants).length > 0) {
    areas.push('variant')
  }

  if (theme.states && Object.keys(theme.states).length > 0) {
    areas.push('state')
  }

  return {
    value,
    label: formatEditorLabel(value),
    areas: areas.length > 0 ? areas : ['base', 'state'],
    slots: Object.keys(theme.slots ?? {}),
    variants: Object.keys(theme.variants ?? {}),
    variantColors: mergeUniqueValues(
      defaultVariantColors,
      Object.values(theme.variants ?? {}).flatMap(variant => Object.keys(variant ?? {}))
    ),
    tokenSuggestions: createTokenSuggestions({
      slot: mergeUniqueValues(
        ['bg', 'text', 'border', 'ring'], 
        Object.keys(theme.slots ?? {}).flatMap(slot => getTokenKeys(theme.slots?.[slot]))
      ),
      variant: mergeUniqueValues(
        ['bg', 'text', 'border', 'ring', 'shadow'], 
        Object.values(theme.variants ?? {}).flatMap(variant => 
          Object.values(variant ?? {}).flatMap(tokens => getTokenKeys(tokens))
        )
      ),
      state: mergeUniqueValues(
        ['bg', 'text', 'border', 'ring', 'shadow', 'opacity'], 
        Object.values(theme.states ?? {}).flatMap(tokens => getTokenKeys(tokens))
      ),
    }),
  }
}

export function getComponentThemeEditorDefinitions(componentThemes?: PaletteComponentThemes) {
  const mergedDefinitions = new Map<string, ComponentThemeEditorDefinition>(
    defaultComponentDefinitions.map(definition => [definition.value, definition])
  )

  Object.entries(componentThemes ?? {}).forEach(([value, theme]) => {
    const current = mergedDefinitions.get(value)
    const dynamic = getDynamicDefinition(value, theme)

    if (!current) {
      mergedDefinitions.set(value, dynamic)
      return
    }

    mergedDefinitions.set(value, {
      ...current,
      areas: mergeUniqueValues(current.areas, dynamic.areas) as ComponentEditorArea[],
      slots: mergeUniqueValues(current.slots, dynamic.slots),
      variants: mergeUniqueValues(current.variants, dynamic.variants),
      variantColors: mergeUniqueValues(current.variantColors, dynamic.variantColors),
      tokenSuggestions: {
        base: mergeUniqueValues(current.tokenSuggestions.base, dynamic.tokenSuggestions.base),
        slot: mergeUniqueValues(current.tokenSuggestions.slot, dynamic.tokenSuggestions.slot),
        variant: mergeUniqueValues(current.tokenSuggestions.variant, dynamic.tokenSuggestions.variant),
        state: mergeUniqueValues(current.tokenSuggestions.state, dynamic.tokenSuggestions.state),
      },
    })
  })

  return [...mergedDefinitions.values()]
}

export function getComponentThemeTokenGroup(
  theme: PaletteComponentThemeSection | undefined,
  area: ComponentEditorArea,
  options: {
    slot?: string
    variant?: string
    variantColor?: string
    state?: string
  } = {}
): PaletteTokenGroup {
  if (!theme) {
    return {}
  }

  if (area === 'base') {
    return normalizeTokenGroup(theme.base)
  }

  if (area === 'slot' && options.slot) {
    return normalizeTokenGroup(theme.slots?.[options.slot])
  }

  if (area === 'variant' && options.variant && options.variantColor) {
    return normalizeTokenGroup(theme.variants?.[options.variant]?.[options.variantColor])
  }

  if (area === 'state' && options.state) {
    return normalizeTokenGroup(theme.states?.[options.state])
  }

  return {}
}

export function getComponentThemeStateNames(componentThemes?: PaletteComponentThemes) {
  const stateNames = new Set(defaultStateNames)

  Object.values(componentThemes ?? {}).forEach((theme) => {
    Object.keys(theme.states ?? {}).forEach(stateName => stateNames.add(stateName))
  })

  return [...stateNames]
}
