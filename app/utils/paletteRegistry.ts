import carbonAndSulfur from '~/data/palettes/carbon-and-sulfur.json'
import extremeSportLanding from '~/data/palettes/extreme-sport-landing.json'
import type { PaletteDefinition, PaletteOption } from '~/types/palette'
import { normalizePaletteDefinition } from '~/utils/palette-domain'

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

const normalizedExtremeSportLanding = normalizePaletteDefinition(extremeSportLanding as PaletteDefinition)
const normalizedCarbonAndSulfur = normalizePaletteDefinition(carbonAndSulfur as PaletteDefinition)

export const emptyPalette = createNullPalette(normalizedExtremeSportLanding)

export const paletteOptions = [
  { id: 'default', name: 'Empty Palette', type: 'default' },
  { id: 'extremeSportLanding', name: normalizedExtremeSportLanding.name, type: 'preset', palette: normalizedExtremeSportLanding },
  { id: 'carbonAndSulfur', name: normalizedCarbonAndSulfur.name, type: 'preset', palette: normalizedCarbonAndSulfur }
] as const satisfies readonly PaletteOption[]

export const defaultPalettes = paletteOptions.reduce<PaletteDefinition[]>((palettes, option) => {
  if (option.type === 'preset') {
    palettes.push(option.palette as PaletteDefinition)
  }

  return palettes
}, [])
