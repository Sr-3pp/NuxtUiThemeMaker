import type { ThemeSchema } from '~/types/theme-builder'

function buildTokenName(section: string, key: string) {
  if (section === 'ui') {
    return `--ui-${key}`
  }

  // Nuxt UI semantic color tokens are --ui-primary/secondary/... (not --ui-color-*).
  if (section === 'color') {
    return `--ui-${key}`
  }

  if (key === 'default') {
    return `--ui-${section}`
  }

  return `--ui-${section}-${key}`
}

export default function themeBuilder(colorSchema: ThemeSchema) {
  const theme: Record<string, string> = {}

  Object.entries(colorSchema).forEach(([section, value]) => {
    if (value && typeof value === 'object') {
      Object.entries(value).forEach(([key, nestedValue]) => {
        if (nestedValue != null) {
          theme[buildTokenName(section, key)] = nestedValue
        }
      })
      return
    }

    if (value != null) {
      theme[`${section.includes('--ui') ? '' : '--ui-'}${section}`] = value
    }
  })

  return theme
}
