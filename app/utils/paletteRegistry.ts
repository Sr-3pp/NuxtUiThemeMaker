import type { PaletteDefinition, PaletteOption } from '~/types/palette'
import { normalizePaletteDefinition } from '~/utils/palette-domain'

const paletteModules = import.meta.glob<unknown>('../data/**/*.json', {
  eager: true,
  import: 'default',
})

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isPaletteDefinition(value: unknown): value is PaletteDefinition {
  if (!isRecord(value) || typeof value.name !== 'string' || !isRecord(value.modes)) {
    return false
  }

  return isRecord(value.modes.light) && isRecord(value.modes.dark)
}

function createPaletteId(path: string) {
  return path
    .replace(/^\.\.\/data\//, '')
    .replace(/^palettes\//, '')
    .split('/')
    .join('-')
    ?.replace(/\.json$/, '')
    .replace(/-([a-z0-9])/g, (_, character: string) => character.toUpperCase())
    ?? 'palette'
}

function createNullPalette(source: PaletteDefinition): PaletteDefinition {
  return {
    name: 'Empty Palette',
    modes: {
      light: Object.fromEntries(
        Object.entries(source.modes.light).map(([section, tokens]) => [
          section,
          Object.fromEntries(Object.keys(tokens).map(token => [token, null]))
        ])
      ),
      dark: Object.fromEntries(
        Object.entries(source.modes.dark).map(([section, tokens]) => [
          section,
          Object.fromEntries(Object.keys(tokens).map(token => [token, null]))
        ])
      )
    }
  }
}

const palettePresets = Object.entries(paletteModules)
  .reduce<Array<{ id: string, palette: PaletteDefinition }>>((presets, [path, palette]) => {
    if (isPaletteDefinition(palette)) {
      presets.push({
        id: createPaletteId(path),
        palette: normalizePaletteDefinition(palette),
      })
    }

    return presets
  }, [])
  .sort((first, second) => first.id.localeCompare(second.id))

export const emptyPalette = createNullPalette(palettePresets[0]!.palette)

export const paletteOptions = [
  { id: 'default', name: 'Empty Palette', type: 'default' },
  ...palettePresets.map(({ id, palette }) => ({
    id,
    name: palette.name,
    type: 'preset' as const,
    palette,
  })),
] as const satisfies readonly PaletteOption[]

export const defaultPalettes = paletteOptions.reduce<PaletteDefinition[]>((palettes, option) => {
  if (option.type === 'preset') {
    palettes.push(option.palette as PaletteDefinition)
  }

  return palettes
}, [])

export function getRandomDefaultPalette() {
  const randomIndex = Math.floor(Math.random() * defaultPalettes.length)
  return defaultPalettes[randomIndex] ?? defaultPalettes[0]!
}
