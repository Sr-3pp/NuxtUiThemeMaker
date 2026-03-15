import carbonAndSulfur from '~/data/palettes/carbon-and-sulfur.json'
import extremeSportLanding from '~/data/palettes/extreme-sport-landing.json'
import type { PaletteDefinition, PaletteOption } from '~/types/palette'

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

export const emptyPalette = createNullPalette(extremeSportLanding as PaletteDefinition)

export const paletteOptions = [
  { id: 'default', name: 'Empty Palette', type: 'default' },
  { id: 'extremeSportLanding', name: extremeSportLanding.name, type: 'preset', palette: extremeSportLanding },
  { id: 'carbonAndSulfur', name: carbonAndSulfur.name, type: 'preset', palette: carbonAndSulfur }
] as const satisfies readonly PaletteOption[]
