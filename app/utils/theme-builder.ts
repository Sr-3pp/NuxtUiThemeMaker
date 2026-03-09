type ThemeValue = string | null
type ThemeSection = Record<string, ThemeValue>
type ThemeSchema = Record<string, ThemeValue | ThemeSection>

function buildTokenName(section: string, key: string) {
  if (section === 'ui') {
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