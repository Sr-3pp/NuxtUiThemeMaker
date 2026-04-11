import type {
  PaletteComparisonChange,
  PaletteComparisonChangeType,
  PaletteComparisonReport,
} from '~/types/palette-version'
import type { PaletteDefinition as ThemePaletteDefinition } from '~/types/palette'

function flattenPaletteValue(
  value: unknown,
  prefix: string,
  entries: Map<string, string | null>,
) {
  if (value === null || value === undefined) {
    entries.set(prefix, null)
    return
  }

  if (typeof value !== 'object' || Array.isArray(value)) {
    entries.set(prefix, String(value))
    return
  }

  const objectValue = value as Record<string, unknown>

  Object.keys(objectValue)
    .sort((left, right) => left.localeCompare(right))
    .forEach((key) => {
      const nextPrefix = prefix ? `${prefix}.${key}` : key
      flattenPaletteValue(objectValue[key], nextPrefix, entries)
    })
}

function flattenPalette(palette: ThemePaletteDefinition) {
  const entries = new Map<string, string | null>()

  flattenPaletteValue(palette, '', entries)

  return entries
}

function getChangeSection(path: string) {
  if (path.startsWith('modes.light.')) {
    return 'Light mode'
  }

  if (path.startsWith('modes.dark.')) {
    return 'Dark mode'
  }

  if (path.startsWith('colors.')) {
    return 'Color scales'
  }

  if (path.startsWith('aliases.')) {
    return 'Aliases'
  }

  if (path.startsWith('components.')) {
    return 'Components'
  }

  if (path.startsWith('metadata.')) {
    return 'Metadata'
  }

  return 'Palette'
}

function getChangeType(before: string | null | undefined, after: string | null | undefined): PaletteComparisonChangeType {
  if (before == null && after != null) {
    return 'added'
  }

  if (before != null && after == null) {
    return 'removed'
  }

  return 'changed'
}

export function comparePaletteVersions(
  fromPalette: ThemePaletteDefinition,
  toPalette: ThemePaletteDefinition,
  input: {
    fromVersion: number
    toVersion: number
  },
): PaletteComparisonReport {
  const fromEntries = flattenPalette(fromPalette)
  const toEntries = flattenPalette(toPalette)
  const paths = Array.from(new Set([
    ...fromEntries.keys(),
    ...toEntries.keys(),
  ])).sort((left, right) => left.localeCompare(right))

  const changes: PaletteComparisonChange[] = []

  for (const path of paths) {
    const before = fromEntries.get(path)
    const after = toEntries.get(path)

    if (before === after) {
      continue
    }

    changes.push({
      path,
      section: getChangeSection(path),
      type: getChangeType(before, after),
      before: before ?? null,
      after: after ?? null,
    })
  }

  const sectionCounts = changes.reduce<Record<string, number>>((counts, change) => {
    counts[change.section] = (counts[change.section] ?? 0) + 1
    return counts
  }, {})

  return {
    fromVersion: input.fromVersion,
    toVersion: input.toVersion,
    totalChanges: changes.length,
    addedCount: changes.filter(change => change.type === 'added').length,
    removedCount: changes.filter(change => change.type === 'removed').length,
    changedCount: changes.filter(change => change.type === 'changed').length,
    sectionCounts,
    changes,
  }
}
