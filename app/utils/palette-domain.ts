import type { PaletteDefinition, PaletteModeKey, PaletteTokenValue } from '~/types/palette'
import type { StoredPalette } from '~/types/palette-store'

export type EditablePalette = PaletteDefinition & Partial<Omit<StoredPalette, 'name' | 'palette'>>

export interface UpdateEditablePaletteTokenPayload {
  mode: PaletteModeKey
  section: string
  token: string
  value: PaletteTokenValue
}

function clonePaletteMode(mode: PaletteDefinition['modes']['light']) {
  return Object.fromEntries(
    Object.entries(mode).map(([section, tokens]) => [section, { ...tokens }])
  )
}

export function clonePaletteDefinition(palette: PaletteDefinition): PaletteDefinition {
  return {
    name: palette.name,
    modes: {
      light: clonePaletteMode(palette.modes.light),
      dark: clonePaletteMode(palette.modes.dark),
    },
  }
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
  }

  return palette
}
