export type PreviewAreaKey =
  | 'actions'
  | 'stateMatrix'
  | 'navigation'
  | 'forms'
  | 'overlays'
  | 'surfaces'
  | 'dataDisplay'
  | 'feedback'
  | 'systemStates'
  | 'commandCenter'
  | 'notifications'
  | 'typography'

export interface PreviewAreaDefinition {
  value: PreviewAreaKey
  label: string
  tab: 'components' | 'forms' | 'surfaces' | 'typography'
  components: string[]
  tokens: string[]
  description: string
}

export const previewAreaDefinitions: PreviewAreaDefinition[] = [
  {
    value: 'actions',
    label: 'Actions',
    tab: 'components',
    components: ['UButton', 'UBadge'],
    tokens: ['button variants', 'button states', 'semantic colors'],
    description: 'Button variants, emphasis levels, icon treatments and status badges.',
  },
  {
    value: 'stateMatrix',
    label: 'State Matrix',
    tab: 'components',
    components: ['UButton', 'UInput', 'UBadge', 'UAlert'],
    tokens: ['button states', 'input focus', 'disabled contrast', 'semantic feedback'],
    description: 'Explicit QA sweep for default, hover-target, active-target, error and disabled states.',
  },
  {
    value: 'navigation',
    label: 'Navigation',
    tab: 'components',
    components: ['UTabs', 'UAccordion', 'UBreadcrumb', 'UNavigationMenu', 'UPagination'],
    tokens: ['surface contrast', 'active states', 'highlight colors'],
    description: 'Tabs, disclosure, menus and traversal components under shared navigation tokens.',
  },
  {
    value: 'forms',
    label: 'Forms',
    tab: 'forms',
    components: ['UInput', 'UTextarea', 'USelect', 'URadioGroup', 'UCheckbox', 'USwitch'],
    tokens: ['input base', 'focus ring', 'border', 'muted surfaces'],
    description: 'Field controls, invalid/disabled states and value density across input components.',
  },
  {
    value: 'overlays',
    label: 'Overlays',
    tab: 'forms',
    components: ['UPopover', 'UModal', 'UDrawer', 'UDropdownMenu'],
    tokens: ['overlay bg', 'overlay border', 'button actions'],
    description: 'Popover, menu, modal and drawer contrast outside the main canvas.',
  },
  {
    value: 'surfaces',
    label: 'Surfaces',
    tab: 'surfaces',
    components: ['UCard', 'USeparator'],
    tokens: ['bg', 'border', 'elevated', 'accented', 'inverted'],
    description: 'Container layering, nested surfaces and elevation balance.',
  },
  {
    value: 'dataDisplay',
    label: 'Data Display',
    tab: 'surfaces',
    components: ['UTable', 'UAvatar', 'UBadge'],
    tokens: ['table contrast', 'avatar rings', 'tag emphasis'],
    description: 'Compact data patterns for support, admin and operational UIs.',
  },
  {
    value: 'feedback',
    label: 'Feedback',
    tab: 'surfaces',
    components: ['UAlert', 'UProgress', 'USkeleton'],
    tokens: ['status colors', 'progress fills', 'loading surfaces'],
    description: 'Alerts, progress and loading states across semantic feedback colors.',
  },
  {
    value: 'systemStates',
    label: 'Empty States',
    tab: 'surfaces',
    components: ['UEmpty', 'UTimeline'],
    tokens: ['empty state CTA', 'icon emphasis', 'step progression'],
    description: 'Empty states and step-based communication patterns for dashboard and workflow screens.',
  },
  {
    value: 'commandCenter',
    label: 'Command Palette',
    tab: 'surfaces',
    components: ['UCommandPalette', 'UKbd'],
    tokens: ['search state', 'group labels', 'kbd hints'],
    description: 'Grouped search and command density for app-level command palette interactions.',
  },
  {
    value: 'notifications',
    label: 'Notifications',
    tab: 'surfaces',
    components: ['UToast'],
    tokens: ['toast surfaces', 'semantic feedback', 'horizontal actions'],
    description: 'Toast messaging for save confirmations, warnings and lightweight status updates.',
  },
  {
    value: 'typography',
    label: 'Typography',
    tab: 'typography',
    components: ['text styles', 'UKbd', 'UChip', 'UBadge'],
    tokens: ['text', 'muted', 'dimmed', 'primary links', 'accented labels'],
    description: 'Type scale, editorial block and inline emphasis for readability review.',
  },
]

export function getPreviewAreaDefinition(value: PreviewAreaKey) {
  return previewAreaDefinitions.find(area => area.value === value)
}
