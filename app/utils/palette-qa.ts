import type { PaletteDefinition, PaletteModeKey } from '~/types/palette'
import type { ThemeQaIssue, ThemeQaReadinessItem, ThemeQaReport, ThemeQaSeverity, ThemeQaStatus } from '~/types/theme-qa'
import { parseHexColor, type HexRgbColor } from './color-hex'

interface ContrastPairDefinition {
  id: string
  title: string
  foregroundSection: string
  foregroundToken: string
  backgroundSection: string
  backgroundToken: string
  minimum: number
  severity: ThemeQaSeverity
}

const contrastPairs: ContrastPairDefinition[] = [
  {
    id: 'body-default',
    title: 'Body text on default surface',
    foregroundSection: 'text',
    foregroundToken: 'default',
    backgroundSection: 'bg',
    backgroundToken: 'default',
    minimum: 4.5,
    severity: 'critical',
  },
  {
    id: 'body-elevated',
    title: 'Body text on elevated surface',
    foregroundSection: 'text',
    foregroundToken: 'default',
    backgroundSection: 'bg',
    backgroundToken: 'elevated',
    minimum: 4.5,
    severity: 'critical',
  },
  {
    id: 'muted-default',
    title: 'Muted text on default surface',
    foregroundSection: 'text',
    foregroundToken: 'muted',
    backgroundSection: 'bg',
    backgroundToken: 'default',
    minimum: 4.5,
    severity: 'warning',
  },
  {
    id: 'dimmed-muted',
    title: 'Dimmed text on muted surface',
    foregroundSection: 'text',
    foregroundToken: 'dimmed',
    backgroundSection: 'bg',
    backgroundToken: 'muted',
    minimum: 4.5,
    severity: 'warning',
  },
  {
    id: 'highlighted-default',
    title: 'Highlighted text on default surface',
    foregroundSection: 'text',
    foregroundToken: 'highlighted',
    backgroundSection: 'bg',
    backgroundToken: 'default',
    minimum: 4.5,
    severity: 'critical',
  },
  {
    id: 'inverted-inverted',
    title: 'Inverted text on inverted surface',
    foregroundSection: 'text',
    foregroundToken: 'inverted',
    backgroundSection: 'bg',
    backgroundToken: 'inverted',
    minimum: 4.5,
    severity: 'critical',
  },
]

const requiredTokenPairs = [
  ['text', 'default'],
  ['text', 'highlighted'],
  ['bg', 'default'],
  ['bg', 'elevated'],
  ['ui', 'border'],
  ['ui', 'ring'],
  ['color', 'primary'],
  ['color', 'error'],
] as const

const semanticColorKeys = ['primary', 'secondary', 'success', 'info', 'warning', 'error'] as const

const severityWeight: Record<ThemeQaSeverity, number> = {
  critical: 18,
  warning: 7,
  info: 3,
}

function calculateRelativeLuminance(color: HexRgbColor) {
  const channels = [color.r, color.g, color.b].map((channel) => {
    const normalized = channel / 255

    if (normalized <= 0.03928) {
      return normalized / 12.92
    }

    return ((normalized + 0.055) / 1.055) ** 2.4
  })

  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!
}

function calculateContrastRatio(foreground: string | null | undefined, background: string | null | undefined) {
  const foregroundColor = parseHexColor(foreground)
  const backgroundColor = parseHexColor(background)

  if (!foregroundColor || !backgroundColor) {
    return null
  }

  const foregroundLuminance = calculateRelativeLuminance(foregroundColor)
  const backgroundLuminance = calculateRelativeLuminance(backgroundColor)
  const lighter = Math.max(foregroundLuminance, backgroundLuminance)
  const darker = Math.min(foregroundLuminance, backgroundLuminance)

  return (lighter + 0.05) / (darker + 0.05)
}

function getModeToken(palette: PaletteDefinition, mode: PaletteModeKey, section: string, token: string) {
  return palette.modes[mode]?.[section]?.[token] ?? null
}

function formatRatio(value: number) {
  return Number.parseFloat(value.toFixed(2))
}

function compareSeverity(left: ThemeQaSeverity, right: ThemeQaSeverity) {
  const order: ThemeQaSeverity[] = ['critical', 'warning', 'info']
  return order.indexOf(left) - order.indexOf(right)
}

export function auditPaletteTheme(palette: PaletteDefinition | null | undefined): ThemeQaReport {
  if (!palette) {
    return {
      score: 0,
      status: 'risky',
      issues: [{
        id: 'palette-missing',
        category: 'readiness',
        severity: 'critical',
        mode: 'shared',
        title: 'No palette loaded',
        description: 'Load or create a palette before running theme QA.',
        tokens: [],
      }],
      readiness: [{
        id: 'palette-loaded',
        label: 'Palette loaded',
        passed: false,
        description: 'A palette must exist before export and publish checks can run.',
      }],
      counts: {
        critical: 1,
        warning: 0,
        info: 0,
      },
    }
  }

  const issues: ThemeQaIssue[] = []

  ;(['light', 'dark'] as const).forEach((mode) => {
    requiredTokenPairs.forEach(([section, token]) => {
      if (getModeToken(palette, mode, section, token)) {
        return
      }

      issues.push({
        id: `missing-${mode}-${section}-${token}`,
        category: 'component',
        severity: 'critical',
        mode,
        title: `Missing ${section}.${token}`,
        description: `Core token \`${section}.${token}\` is missing in ${mode} mode. Major previews and exports depend on it.`,
        tokens: [`${section}.${token}`],
      })
    })

    contrastPairs.forEach((pair) => {
      const foreground = getModeToken(palette, mode, pair.foregroundSection, pair.foregroundToken)
      const background = getModeToken(palette, mode, pair.backgroundSection, pair.backgroundToken)
      const ratio = calculateContrastRatio(foreground, background)

      if (ratio == null || ratio >= pair.minimum) {
        return
      }

      issues.push({
        id: `${pair.id}-${mode}`,
        category: 'contrast',
        severity: pair.severity,
        mode,
        title: pair.title,
        description: `${mode} mode falls below ${pair.minimum}:1 with a ${formatRatio(ratio)}:1 contrast ratio.`,
        tokens: [`${pair.foregroundSection}.${pair.foregroundToken}`, `${pair.backgroundSection}.${pair.backgroundToken}`],
        actual: formatRatio(ratio),
        minimum: pair.minimum,
      })
    })

    semanticColorKeys.forEach((token) => {
      const semanticColor = getModeToken(palette, mode, 'color', token)
      const defaultBackground = getModeToken(palette, mode, 'bg', 'default')
      const ratio = calculateContrastRatio(semanticColor, defaultBackground)

      if (ratio == null || ratio >= 3) {
        return
      }

      issues.push({
        id: `semantic-${mode}-${token}`,
        category: 'semantic',
        severity: 'warning',
        mode,
        title: `${token} accent is weak on the default surface`,
        description: `${mode} semantic color \`color.${token}\` is only ${formatRatio(ratio)}:1 against \`bg.default\`, which makes accents and states harder to scan.`,
        tokens: [`color.${token}`, 'bg.default'],
        actual: formatRatio(ratio),
        minimum: 3,
      })
    })

    const primaryColor = getModeToken(palette, mode, 'color', 'primary')
    const secondaryColor = getModeToken(palette, mode, 'color', 'secondary')
    const semanticSeparation = calculateContrastRatio(primaryColor, secondaryColor)

    if (primaryColor && secondaryColor && semanticSeparation != null && semanticSeparation < 1.2) {
      issues.push({
        id: `semantic-separation-${mode}`,
        category: 'semantic',
        severity: 'warning',
        mode,
        title: 'Primary and secondary are too similar',
        description: `${mode} primary and secondary colors only differ by ${formatRatio(semanticSeparation)}:1, which weakens semantic hierarchy.`,
        tokens: ['color.primary', 'color.secondary'],
        actual: formatRatio(semanticSeparation),
        minimum: 1.2,
      })
    }

    const ringColor = getModeToken(palette, mode, 'ui', 'ring')
    const defaultBackground = getModeToken(palette, mode, 'bg', 'default')
    const elevatedBackground = getModeToken(palette, mode, 'bg', 'elevated')
    const borderColor = getModeToken(palette, mode, 'ui', 'border')
    const ringOnDefault = calculateContrastRatio(ringColor, defaultBackground)
    const ringOnElevated = calculateContrastRatio(ringColor, elevatedBackground)
    const ringVsBorder = calculateContrastRatio(ringColor, borderColor)

    if (ringOnDefault != null && ringOnDefault < 3) {
      issues.push({
        id: `focus-default-${mode}`,
        category: 'focus',
        severity: 'warning',
        mode,
        title: 'Focus ring fades into the default surface',
        description: `${mode} focus ring contrast is ${formatRatio(ringOnDefault)}:1 on \`bg.default\`. Aim for at least 3:1 so keyboard focus remains visible.`,
        tokens: ['ui.ring', 'bg.default'],
        actual: formatRatio(ringOnDefault),
        minimum: 3,
      })
    }

    if (ringOnElevated != null && ringOnElevated < 3) {
      issues.push({
        id: `focus-elevated-${mode}`,
        category: 'focus',
        severity: 'warning',
        mode,
        title: 'Focus ring fades into elevated surfaces',
        description: `${mode} focus ring contrast is ${formatRatio(ringOnElevated)}:1 on \`bg.elevated\`. Elevated controls need the ring to stay distinct.`,
        tokens: ['ui.ring', 'bg.elevated'],
        actual: formatRatio(ringOnElevated),
        minimum: 3,
      })
    }

    if (ringVsBorder != null && ringVsBorder < 1.2) {
      issues.push({
        id: `focus-border-${mode}`,
        category: 'focus',
        severity: 'warning',
        mode,
        title: 'Focus ring is too close to the border color',
        description: `${mode} \`ui.ring\` and \`ui.border\` are nearly identical, so focus can read like a static border.`,
        tokens: ['ui.ring', 'ui.border'],
        actual: formatRatio(ringVsBorder),
        minimum: 1.2,
      })
    }
  })

  const buttonPrimary = palette.components?.button?.variants?.solid?.primary

  if (buttonPrimary && (!buttonPrimary.bg || !buttonPrimary.text)) {
    issues.push({
      id: 'button-solid-primary-incomplete',
      category: 'component',
      severity: 'warning',
      mode: 'shared',
      title: 'Primary button override is incomplete',
      description: 'The solid primary button override should set both `bg` and `text` to avoid unreadable actions in the preview.',
      tokens: ['components.button.variants.solid.primary.bg', 'components.button.variants.solid.primary.text'],
    })
  }

  const inputBase = palette.components?.input?.base

  if (inputBase && (!inputBase.bg || !inputBase.text || !inputBase.border)) {
    issues.push({
      id: 'input-base-incomplete',
      category: 'component',
      severity: 'warning',
      mode: 'shared',
      title: 'Input override is incomplete',
      description: 'The input base override should define `bg`, `text`, and `border` together so states do not regress unevenly.',
      tokens: ['components.input.base.bg', 'components.input.base.text', 'components.input.base.border'],
    })
  }

  const counts = issues.reduce<Record<ThemeQaSeverity, number>>((result, issue) => {
    result[issue.severity] += 1
    return result
  }, {
    critical: 0,
    warning: 0,
    info: 0,
  })

  const scorePenalty = issues.reduce((total, issue) => total + severityWeight[issue.severity], 0)
  const score = Math.max(0, 100 - scorePenalty)
  const status: ThemeQaStatus = score >= 85 ? 'healthy' : score >= 65 ? 'needs-work' : 'risky'

  const readiness: ThemeQaReadinessItem[] = [
    {
      id: 'critical-tokens',
      label: 'Critical token coverage',
      passed: !issues.some(issue => issue.category === 'component' && issue.severity === 'critical'),
      description: 'Core semantic, surface, border, and ring tokens exist in both modes.',
    },
    {
      id: 'contrast-aa',
      label: 'Major contrast pairs',
      passed: !issues.some(issue => issue.category === 'contrast' && issue.severity === 'critical'),
      description: 'Body and highlighted text pass the main foreground/background checks.',
    },
    {
      id: 'focus-visibility',
      label: 'Focus visibility',
      passed: !issues.some(issue => issue.category === 'focus'),
      description: 'Focus rings stay visible against surfaces and remain distinct from borders.',
    },
    {
      id: 'semantic-mapping',
      label: 'Semantic mapping',
      passed: !issues.some(issue => issue.category === 'semantic'),
      description: 'Accent colors stay visible on the main surface and preserve hierarchy.',
    },
    {
      id: 'publish-score',
      label: 'Publish score',
      passed: score >= 80,
      description: 'Themes below 80 usually still have enough risk that they should be reviewed before export.',
    },
  ]

  return {
    score,
    status,
    issues: issues.sort((left, right) => {
      const severityComparison = compareSeverity(left.severity, right.severity)

      if (severityComparison !== 0) {
        return severityComparison
      }

      return left.title.localeCompare(right.title)
    }),
    readiness,
    counts,
  }
}
