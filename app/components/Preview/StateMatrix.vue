<script setup lang="ts">
import type {
  AlertStateSample,
  BadgeStateSample,
  ButtonStateRow,
  ButtonStateSample,
  ButtonColor,
  ButtonVariant,
  FieldStateSample,
  PreviewInteractiveProps,
} from '~/types/theme-preview'
import { getPreviewButtonStyle, getPreviewInputStyle } from '~/utils/preview-overrides'

const props = defineProps<PreviewInteractiveProps>()

const buttonRows: ButtonStateRow[] = [
  { color: 'primary', variant: 'solid' },
  { color: 'secondary', variant: 'outline' },
  { color: 'success', variant: 'soft' },
]

const buttonStates: ButtonStateSample[] = [
  { label: 'Default', tone: 'neutral' },
  { label: 'Hover', tone: 'info' },
  { label: 'Active', tone: 'warning' },
  { label: 'Disabled', tone: 'neutral', disabled: true },
]

const fieldStates: FieldStateSample[] = [
  {
    label: 'Default',
    hint: 'Baseline placeholder and border balance.',
    color: 'neutral',
    variant: 'outline',
    value: 'Oceanic theme',
    placeholder: 'Theme name',
  },
  {
    label: 'Focus target',
    hint: 'Ring and emphasized border should stay readable.',
    color: 'primary',
    variant: 'outline',
    value: 'Focused sample',
    placeholder: 'Focused field',
    highlight: true,
    focused: true,
  },
  {
    label: 'Error',
    hint: 'Status color cannot overpower the input text.',
    color: 'error',
    variant: 'outline',
    value: 'Missing contrast token',
    placeholder: 'Contrast issue',
    highlight: true,
  },
  {
    label: 'Disabled',
    hint: 'Muted state still needs enough text contrast.',
    color: 'neutral',
    variant: 'outline',
    value: 'Locked field',
    placeholder: 'Disabled field',
    disabled: true,
  },
]

const badgeStates: BadgeStateSample[] = [
  { label: 'Info', color: 'info', variant: 'soft' },
  { label: 'Success', color: 'success', variant: 'solid' },
  { label: 'Warning', color: 'warning', variant: 'outline' },
  { label: 'Muted', color: 'neutral', variant: 'subtle' },
]

const alertStates: AlertStateSample[] = [
  {
    label: 'Info banner',
    color: 'info',
    variant: 'soft',
    description: 'Use for gentle guidance and navigation feedback.',
  },
  {
    label: 'Warning banner',
    color: 'warning',
    variant: 'outline',
    description: 'Warn before publishing a low-contrast palette.',
  },
  {
    label: 'Error banner',
    color: 'error',
    variant: 'solid',
    description: 'Escalated issues should still preserve icon and body text clarity.',
  },
]

const inputStyle = computed(() => getPreviewInputStyle(props.palette))

function buttonStyle(variant: ButtonVariant, color: ButtonColor) {
  return getPreviewButtonStyle(props.palette, variant, color)
}

function stateCardClass(label: string) {
  if (label === 'Hover') {
    return 'border-info/40 bg-info/5'
  }

  if (label === 'Active') {
    return 'border-warning/40 bg-warning/5'
  }

  return 'border-default bg-default/40'
}
</script>

<template>
  <section class="space-y-4">
    <div class="space-y-1">
      <h3 class="text-lg font-semibold text-highlighted">
        State Matrix
      </h3>
      <p class="text-sm text-muted">
        QA-oriented state sweep for buttons, fields, badges and alerts before exporting a theme.
      </p>
    </div>

    <div class="grid gap-6">
      <UCard variant="outline">
        <template #header>
          <div class="space-y-1">
            <p class="text-sm font-medium text-highlighted">Action states</p>
            <p class="text-sm text-muted">Review default, hover-target, active-target and disabled button treatments side by side.</p>
          </div>
        </template>

        <div class="space-y-4">
          <div
            v-for="row in buttonRows"
            :key="`${row.color}-${row.variant}`"
            class="grid gap-3 lg:grid-cols-[132px_repeat(4,minmax(0,1fr))]"
          >
            <div class="flex items-center">
              <UBadge :color="row.color" variant="soft" class="capitalize">
                {{ row.color }} {{ row.variant }}
              </UBadge>
            </div>

            <div
              v-for="state in buttonStates"
              :key="`${row.color}-${row.variant}-${state.label}`"
              class="rounded-2xl border p-3"
              :class="stateCardClass(state.label)"
            >
              <div class="mb-3 flex items-center justify-between gap-2">
                <p class="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                  {{ state.label }}
                </p>
                <UBadge :color="state.tone" variant="subtle" size="sm">
                  {{ state.label }}
                </UBadge>
              </div>

              <UButton
                :color="row.color"
                :variant="row.variant"
                :disabled="state.disabled || props.disableInteractive"
                class="w-full justify-center"
                :class="state.label === 'Active' ? 'scale-[0.985]' : ''"
                :style="buttonStyle(row.variant, row.color)"
              >
                {{ row.variant }} {{ row.color }}
              </UButton>
            </div>
          </div>
        </div>
      </UCard>

      <div class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <UCard variant="outline">
          <template #header>
            <div class="space-y-1">
              <p class="text-sm font-medium text-highlighted">Field states</p>
              <p class="text-sm text-muted">Input matrix focused on placeholder, focus ring, error contrast and disabled readability.</p>
            </div>
          </template>

          <div class="grid gap-4 md:grid-cols-2">
            <div
              v-for="fieldState in fieldStates"
              :key="fieldState.label"
              class="space-y-2 rounded-2xl border border-default bg-muted/20 p-4"
              :class="fieldState.focused ? 'ring-2 ring-primary/40' : ''"
            >
              <div class="space-y-1">
                <p class="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                  {{ fieldState.label }}
                </p>
                <p class="text-xs text-muted">
                  {{ fieldState.hint }}
                </p>
              </div>

              <UInput
                :model-value="fieldState.value"
                :placeholder="fieldState.placeholder"
                :color="fieldState.color"
                :variant="fieldState.variant"
                :highlight="fieldState.highlight"
                :disabled="fieldState.disabled || props.disableInteractive"
                :style="inputStyle"
              />
            </div>
          </div>
        </UCard>

        <div class="space-y-6">
          <UCard variant="outline">
            <template #header>
              <div class="space-y-1">
                <p class="text-sm font-medium text-highlighted">Badge states</p>
                <p class="text-sm text-muted">Compact status labels should keep hierarchy at small sizes.</p>
              </div>
            </template>

            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="badgeState in badgeStates"
                :key="badgeState.label"
                :color="badgeState.color"
                :variant="badgeState.variant"
              >
                {{ badgeState.label }}
              </UBadge>
            </div>
          </UCard>

          <UCard variant="outline">
            <template #header>
              <div class="space-y-1">
                <p class="text-sm font-medium text-highlighted">Alert states</p>
                <p class="text-sm text-muted">Message containers help verify semantic fills, icon visibility and body copy weight.</p>
              </div>
            </template>

            <div class="space-y-3">
              <UAlert
                v-for="alertState in alertStates"
                :key="alertState.label"
                :title="alertState.label"
                :description="alertState.description"
                :color="alertState.color"
                :variant="alertState.variant"
                icon="i-lucide-shield-alert"
              />
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </section>
</template>
