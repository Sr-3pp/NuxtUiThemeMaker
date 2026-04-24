export const themeAiMessages = {
  starter: {
    generateError: 'Failed to generate the starter theme.',
    applyDescription: 'Applied the generated starter theme to the current draft.',
  },
  directions: {
    generateError: 'Failed to generate theme directions.',
    applyDescription: (name: string) => `Applied the ${name} direction to the current draft.`,
  },
  ramps: {
    generateError: 'Failed to generate color ramps.',
    applyTitle: 'Ramps updated',
    applyDescription: (paletteName: string) => `Applied the generated ramps to ${paletteName}.`,
  },
  palette: {
    applyTitle: 'Palette updated',
  },
} as const

export type ThemeAiTab = 'starter' | 'directions' | 'ramps'
