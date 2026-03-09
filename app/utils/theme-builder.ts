type ThemeSection = Record<string, string | null>
type ThemeSchema = Record<string, string | null | ThemeSection>

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
    const theme: Record<string, string | null> = {}

    Object.entries(colorSchema).forEach(([section, value]) => {
        if (value && typeof value === 'object') {
            Object.entries(value).forEach(([key, nestedValue]) => {
                theme[buildTokenName(section, key)] = nestedValue
            })
            return
        }

        theme[`${section.includes('--ui') ? '' : '--ui-'}${section}`] = value
    })

    return theme
}
