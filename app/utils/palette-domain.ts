import type {
  EditablePalette,
  UpdateEditablePaletteColorScalePayload,
  UpdateEditablePaletteComponentTokenPayload,
  UpdateEditablePaletteTokenPayload,
} from '~/types/palette-editor'
import type {
  PaletteColorScale,
  PaletteColorScales,
  PaletteComponentThemes,
  PaletteDefinition,
  PaletteTokenValue,
} from '../types/palette'
import { paletteScaleSteps } from '../types/palette'
import type { StoredPalette } from '~/types/palette-store'

interface RgbColor {
  r: number
  g: number
  b: number
}

const scaleMixMap: Record<string, { target: RgbColor, amount: number }> = {
  '50': { target: { r: 255, g: 255, b: 255 }, amount: 0.95 },
  '100': { target: { r: 255, g: 255, b: 255 }, amount: 0.88 },
  '200': { target: { r: 255, g: 255, b: 255 }, amount: 0.72 },
  '300': { target: { r: 255, g: 255, b: 255 }, amount: 0.54 },
  '400': { target: { r: 255, g: 255, b: 255 }, amount: 0.26 },
  '500': { target: { r: 0, g: 0, b: 0 }, amount: 0 },
  '600': { target: { r: 0, g: 0, b: 0 }, amount: 0.12 },
  '700': { target: { r: 0, g: 0, b: 0 }, amount: 0.24 },
  '800': { target: { r: 0, g: 0, b: 0 }, amount: 0.38 },
  '900': { target: { r: 0, g: 0, b: 0 }, amount: 0.52 },
  '950': { target: { r: 0, g: 0, b: 0 }, amount: 0.64 },
}

function clonePaletteMode(mode: PaletteDefinition['modes']['light']) {
  return Object.fromEntries(
    Object.entries(mode).map(([section, tokens]) => [section, { ...tokens }])
  )
}

function createEmptyColorScale(): PaletteColorScale {
  return Object.fromEntries(
    paletteScaleSteps.map(step => [step, null])
  ) as PaletteColorScale
}

function clampChannel(value: number) {
  return Math.min(255, Math.max(0, Math.round(value)))
}

function normalizeHexColor(value: string | null | undefined) {
  const normalized = value?.trim()

  if (!normalized) {
    return null
  }

  const match = normalized.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)

  if (!match) {
    return null
  }

  const hex = match[1]

  if (!hex) {
    return null
  }

  if (hex.length === 3) {
    return `#${hex.split('').map(char => `${char}${char}`).join('').toLowerCase()}`
  }

  return `#${hex.toLowerCase()}`
}

function parseHexColor(value: string | null | undefined): RgbColor | null {
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

function toHexColor(color: RgbColor) {
  return `#${[color.r, color.g, color.b].map(channel => clampChannel(channel).toString(16).padStart(2, '0')).join('')}`
}

function mixColors(source: RgbColor, target: RgbColor, amount: number): RgbColor {
  return {
    r: source.r + (target.r - source.r) * amount,
    g: source.g + (target.g - source.g) * amount,
    b: source.b + (target.b - source.b) * amount,
  }
}

function generateColorScale(baseColor: string | null | undefined): PaletteColorScale {
  const parsedBaseColor = parseHexColor(baseColor)

  if (!parsedBaseColor) {
    const emptyScale = createEmptyColorScale()
    emptyScale['500'] = baseColor ?? null
    return emptyScale
  }

  return Object.fromEntries(
    paletteScaleSteps.map((step) => {
      if (step === '500') {
        return [step, toHexColor(parsedBaseColor)]
      }

      const mix = scaleMixMap[step]

      if (!mix) {
        return [step, null]
      }

      return [step, toHexColor(mixColors(parsedBaseColor, mix.target, mix.amount))]
    })
  ) as PaletteColorScale
}

function mergeColorScaleWithGenerated(scale: PaletteColorScale | undefined, baseColor: string | null | undefined) {
  const generatedScale = generateColorScale(baseColor)

  if (!scale) {
    return generatedScale
  }

  return Object.fromEntries(
    paletteScaleSteps.map(step => [step, scale[step] ?? generatedScale[step]])
  ) as PaletteColorScale
}

function cloneColorScales(colors?: PaletteColorScales) {
  if (!colors) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(colors).map(([colorKey, scale]) => [colorKey, { ...scale }])
  )
}

function cloneComponentThemes(components?: PaletteComponentThemes) {
  if (!components) {
    return {}
  }

  return JSON.parse(JSON.stringify(components)) as PaletteComponentThemes
}

function ensureComponentThemeSection(palette: EditablePalette, componentKey: string) {
  if (!palette.components) {
    palette.components = {}
  }

  if (!palette.components[componentKey]) {
    palette.components[componentKey] = {}
  }

  return palette.components[componentKey]
}

function deriveColorScales(palette: PaletteDefinition): PaletteColorScales {
  const colors = cloneColorScales(palette.colors)

  ;(['light', 'dark'] as const).forEach((modeKey) => {
    const semanticColors = palette.modes[modeKey].color ?? {}

    Object.entries(semanticColors).forEach(([tokenKey, tokenValue]) => {
      colors[tokenKey] = mergeColorScaleWithGenerated(colors[tokenKey], colors[tokenKey]?.['500'] ?? tokenValue)
    })
  })

  return colors
}

function deriveAliases(palette: PaletteDefinition) {
  const aliases = {
    primary: 'primary',
    secondary: 'secondary',
    neutral: 'neutral',
    success: 'success',
    info: 'info',
    warning: 'warning',
    error: 'error',
    ...palette.aliases,
  }

  return aliases
}

function normalizePaletteMetadata(palette: PaletteDefinition) {
  return {
    version: 2,
    normalizedAt: palette.metadata?.normalizedAt ?? null,
  }
}

export function normalizePaletteDefinition(palette: PaletteDefinition): PaletteDefinition {
  const hydratedPalette = hydratePaletteDefinition({
    ...palette,
    modes: {
      light: clonePaletteMode(palette.modes.light),
      dark: clonePaletteMode(palette.modes.dark),
    },
  })

  return {
    name: hydratedPalette.name,
    modes: hydratedPalette.modes,
    colors: deriveColorScales(hydratedPalette),
    aliases: deriveAliases(hydratedPalette),
    components: cloneComponentThemes(hydratedPalette.components),
    metadata: normalizePaletteMetadata(hydratedPalette),
  }
}

export function clonePaletteDefinition(palette: PaletteDefinition): PaletteDefinition {
  return normalizePaletteDefinition(palette)
}

export function toEditablePalette(palette: PaletteDefinition | StoredPalette): EditablePalette {
  if ('_id' in palette) {
    const clonedPalette = clonePaletteDefinition({
      name: palette.name,
      modes: palette.palette.modes,
    })

    return {
      name: clonedPalette.name,
      modes: clonedPalette.modes,
      _id: palette._id,
      userId: palette.userId,
      slug: palette.slug,
      isPublic: palette.isPublic,
      createdAt: palette.createdAt,
      updatedAt: palette.updatedAt,
    }
  }

  const clonedPalette = clonePaletteDefinition(palette)

  return {
    name: clonedPalette.name,
    modes: clonedPalette.modes,
  }
}

export function hydratePaletteDefinition(palette: PaletteDefinition) {
  ;(['light', 'dark'] as const).forEach((modeKey) => {
    const mode = palette.modes[modeKey]

    if (!mode.color) {
      mode.color = {
        primary: mode.ui?.primary ?? null,
        secondary: mode.ui?.secondary ?? null,
        neutral: mode.ui?.neutral ?? null,
        success: mode.ui?.success ?? null,
        info: mode.ui?.info ?? null,
        warning: mode.ui?.warning ?? null,
        error: mode.ui?.error ?? null,
      }
    }
  })

  palette.colors = deriveColorScales(palette)
  palette.aliases = deriveAliases(palette)
  palette.components = cloneComponentThemes(palette.components)
  palette.metadata = normalizePaletteMetadata(palette)

  return palette
}

export function createEditablePalette(palette: PaletteDefinition | StoredPalette): EditablePalette {
  return hydratePaletteDefinition(toEditablePalette(palette))
}

export function updateEditablePaletteToken(
  palette: EditablePalette,
  { mode, section, token, value }: UpdateEditablePaletteTokenPayload
) {
  const paletteMode = palette.modes[mode]
  const paletteSection = paletteMode[section]

  if (!paletteSection) {
    return palette
  }

  paletteSection[token] = value

  if (section === 'color') {
    const semanticSection = paletteMode.ui

    if (!semanticSection) {
      return palette
    }

    semanticSection[token] = value

    if (!palette.colors) {
      palette.colors = {}
    }

    if (!palette.colors[token]) {
      palette.colors[token] = createEmptyColorScale()
    }

    palette.colors[token] = generateColorScale(value as PaletteTokenValue)
  }

  return palette
}

export function updateEditablePaletteColorScale(
  palette: EditablePalette,
  { colorKey, step, value, syncMode = 'both' }: UpdateEditablePaletteColorScalePayload
) {
  if (!palette.colors) {
    palette.colors = {}
  }

  if (!palette.colors[colorKey]) {
    palette.colors[colorKey] = createEmptyColorScale()
  }

  if (step === '500') {
    palette.colors[colorKey] = generateColorScale(value)
  }

  palette.colors[colorKey][step as keyof PaletteColorScale] = value

  if (step !== '500') {
    return palette
  }

  const targetModes = syncMode === 'both' ? ['light', 'dark'] as const : [syncMode]

  targetModes.forEach((modeKey) => {
    const mode = palette.modes[modeKey]

    if (!mode.color) {
      mode.color = {}
    }

    if (!mode.ui) {
      mode.ui = {}
    }

    mode.color[colorKey] = value
    mode.ui[colorKey] = value
  })

  return palette
}

export function updateEditablePaletteComponentToken(
  palette: EditablePalette,
  payload: UpdateEditablePaletteComponentTokenPayload
) {
  const componentSection = ensureComponentThemeSection(palette, payload.component)

  if (payload.area === 'base') {
    componentSection.base = {
      ...componentSection.base,
      [payload.token]: payload.value,
    }

    return palette
  }

  if (payload.area === 'slot' && payload.slot) {
    componentSection.slots = {
      ...componentSection.slots,
      [payload.slot]: {
        ...(componentSection.slots?.[payload.slot] ?? {}),
        [payload.token]: payload.value,
      },
    }

    return palette
  }

  if (payload.area === 'variant' && payload.variant && payload.variantColor) {
    componentSection.variants = {
      ...componentSection.variants,
      [payload.variant]: {
        ...(componentSection.variants?.[payload.variant] ?? {}),
        [payload.variantColor]: {
          ...(componentSection.variants?.[payload.variant]?.[payload.variantColor] ?? {}),
          [payload.token]: payload.value,
        },
      },
    }

    return palette
  }

  if (payload.area === 'state' && payload.state) {
    componentSection.states = {
      ...componentSection.states,
      [payload.state]: {
        ...(componentSection.states?.[payload.state] ?? {}),
        [payload.token]: payload.value,
      },
    }
  }

  return palette
}
