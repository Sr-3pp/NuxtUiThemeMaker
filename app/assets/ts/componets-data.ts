import type {
  AlertVariant,
  ButtonVariant,
  CardVariant,
  ChoiceItem,
  ComponentMatrixItem,
  ContentItem,
  ExtendedSemanticColorName,
  SelectItem,
  SemanticColorItem,
  ShowcaseTabItem,
  SurfaceModeItem,
  UtilityFamilyItem
} from '~/types/theme-showcase'

export const semanticColors: SemanticColorItem[] = [
  {
    name: 'primary',
    bg: 'bg-primary',
    text: 'text-primary',
    border: 'border-primary',
    invertedText: 'text-inverted'
  },
  {
    name: 'secondary',
    bg: 'bg-secondary',
    text: 'text-secondary',
    border: 'border-secondary',
    invertedText: 'text-inverted'
  },
  {
    name: 'success',
    bg: 'bg-success',
    text: 'text-success',
    border: 'border-success',
    invertedText: 'text-inverted'
  },
  {
    name: 'info',
    bg: 'bg-info',
    text: 'text-info',
    border: 'border-info',
    invertedText: 'text-inverted'
  },
  {
    name: 'warning',
    bg: 'bg-warning',
    text: 'text-warning',
    border: 'border-warning',
    invertedText: 'text-highlighted'
  },
  {
    name: 'error',
    bg: 'bg-error',
    text: 'text-error',
    border: 'border-error',
    invertedText: 'text-inverted'
  }
]

export const buttonVariants: readonly ButtonVariant[] = ['solid', 'outline', 'soft', 'subtle', 'ghost', 'link']
export const alertVariants: readonly AlertVariant[] = ['solid', 'outline', 'soft', 'subtle']
export const cardVariants: readonly CardVariant[] = ['outline', 'soft', 'subtle', 'solid']

export const textTokens = [
  'text-dimmed',
  'text-muted',
  'text-toned',
  'text-default',
  'text-highlighted',
  'text-inverted'
]

export const bgTokens = [
  'bg-default',
  'bg-muted',
  'bg-elevated',
  'bg-accented',
  'bg-inverted'
]

export const borderTokens = [
  'border-default',
  'border-muted',
  'border-accented',
  'border-inverted'
]

export const ringTokens = [
  'ring-default',
  'ring-muted',
  'ring-accented',
  'ring-inverted'
]

export const divideTokens = [
  'divide-default',
  'divide-muted',
  'divide-accented',
  'divide-inverted'
]

export const outlineTokens = [
  'outline-default',
  'outline-inverted'
]

export const strokeTokens = [
  'stroke-bg',
  'stroke-default',
  'stroke-inverted'
]

export const fillTokens = [
  'fill-bg',
  'fill-default',
  'fill-inverted'
]

export const radiusTokens = [
  'rounded-none',
  'rounded-sm',
  'rounded-md',
  'rounded-lg',
  'rounded-xl',
  'rounded-2xl',
  'rounded-3xl',
  'rounded-full'
]

export const shadowTokens = [
  'shadow-xs',
  'shadow-sm',
  'shadow',
  'shadow-md',
  'shadow-lg',
  'shadow-xl'
]

export const utilityFamilies: UtilityFamilyItem[] = [
  { family: 'Text', classes: textTokens.join(', '), count: textTokens.length },
  { family: 'Background', classes: bgTokens.join(', '), count: bgTokens.length },
  { family: 'Border', classes: borderTokens.join(', '), count: borderTokens.length },
  { family: 'Ring', classes: ringTokens.join(', '), count: ringTokens.length },
  { family: 'Divide', classes: divideTokens.join(', '), count: divideTokens.length },
  { family: 'Outline', classes: outlineTokens.join(', '), count: outlineTokens.length },
  { family: 'Stroke', classes: strokeTokens.join(', '), count: strokeTokens.length },
  { family: 'Fill', classes: fillTokens.join(', '), count: fillTokens.length }
]

export const showcaseTabs: ShowcaseTabItem[] = [
  { label: 'Preview', value: 'components', slot: 'components' },
  { label: 'Utilities', value: 'utilities', slot: 'utilities' },
  { label: 'Ramps', value: 'palette', slot: 'palette' }
]

export const componentMatrix: ComponentMatrixItem[] = [
  { component: 'UButton', coverage: 'color, variant, size, disabled', surface: 'primary to neutral interactive states' },
  { component: 'UBadge', coverage: 'color, emphasis, labels', surface: 'semantic accent contrast' },
  { component: 'UAlert', coverage: 'solid/outline/soft/subtle', surface: 'status surfaces and text contrast' },
  { component: 'UCard', coverage: 'outline/soft/subtle/solid', surface: 'surface layering and separators' },
  { component: 'UInput / UTextarea / USelect', coverage: 'focus rings, placeholder, muted text', surface: 'form states and readable text' },
  { component: 'URadioGroup / UCheckboxGroup / USwitch', coverage: 'selection and active indicators', surface: 'accent color correctness' },
  { component: 'UTabs / UAccordion', coverage: 'active, inactive, container hierarchy', surface: 'navigation + disclosure patterns' },
  { component: 'UProgress / UTable / UAvatarGroup', coverage: 'status fill, borders, muted surfaces', surface: 'data and supporting UI' }
]

export const colorScaleSteps = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']
export const scaleFamilies = ['primary', 'secondary', 'neutral']
export const statusFamilies = ['success', 'info', 'warning', 'error']

export const accordionItems: ContentItem[] = [
  {
    label: 'Semantic aliases',
    content: 'Use text-*, bg-*, border-*, ring-*, divide-*, outline-*, stroke-* and fill-* utilities to validate a theme quickly.',
    value: 'aliases'
  },
  {
    label: 'Component coverage',
    content: 'The showcase now uses Nuxt UI inputs, navigation, feedback, data display and surface components so token problems are visible in real contexts.',
    value: 'coverage'
  },
  {
    label: 'Palette inspection',
    content: 'Primitive ramps are exposed separately so you can compare semantic aliases against the raw color scales behind them.',
    value: 'palette'
  }
]

export const componentTabs: ContentItem[] = [
  {
    label: 'Buttons',
    value: 'buttons',
    slot: 'buttons',
    content: 'All semantic button colors and variants.'
  },
  {
    label: 'Forms',
    value: 'forms',
    slot: 'forms',
    content: 'Inputs, selects and choices.'
  },
  {
    label: 'Data',
    value: 'data',
    slot: 'data',
    content: 'Progress, table and disclosure.'
  }
]

export const selectItems: SelectItem[] = [
  { label: 'Studio', value: 'studio', description: 'Balanced surfaces and strong accents' },
  { label: 'Editorial', value: 'editorial', description: 'Sharper contrast for reading-heavy layouts' },
  { label: 'Playful', value: 'playful', description: 'Higher saturation for expressive products' }
]

export const radioItems: ChoiceItem[] = [
  { label: 'Balanced', value: 'balanced', description: 'Good default contrast and elevation' },
  { label: 'Compact', value: 'compact', description: 'Tighter controls with lower visual weight' },
  { label: 'Bold', value: 'bold', description: 'Higher emphasis for accent-heavy themes' }
]

export const checkboxItems: ChoiceItem[] = [
  { label: 'Alerts', value: 'alerts', description: 'Status colors and feedback UI' },
  { label: 'Forms', value: 'forms', description: 'Inputs, focus rings and controls' },
  { label: 'Data', value: 'data', description: 'Tables, progress and hierarchy' }
]

export const surfaceModes: SurfaceModeItem[] = [
  { label: 'Default', token: 'bg-default text-default border-default' },
  { label: 'Muted', token: 'bg-muted text-default border-muted' },
  { label: 'Elevated', token: 'bg-elevated text-default border-accented' },
  { label: 'Accented', token: 'bg-accented text-highlighted border-accented' },
  { label: 'Inverted', token: 'bg-inverted text-inverted border-inverted' }
]

export const buttonColors: ExtendedSemanticColorName[] = [
  'primary',
  'secondary',
  'success',
  'info',
  'warning',
  'error',
  'neutral'
]
