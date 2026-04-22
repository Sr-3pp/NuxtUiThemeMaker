<script setup lang="ts">
import type { PaletteDefinition } from '~/types/palette'
import type { UpdatePaletteComponentTokenPayload } from '~/types/theme-builder'
import {
  getComponentThemeEditorDefinitions,
  getComponentThemeStateNames,
  getComponentThemeTokenGroup,
} from '~/utils/component-theme-editor'
import { formatPaletteLabel, normalizePaletteTokenValue } from '~/utils/paletteEditor'

const props = withDefaults(defineProps<{
  palette: PaletteDefinition
  title?: string
  description?: string
  emptyTitle?: string
  emptyDescription?: string
  hideHeader?: boolean
}>(), {})

const emit = defineEmits<{
  'update-component-token': [payload: UpdatePaletteComponentTokenPayload]
}>()

const { focusTarget } = useComponentEditorFocus()
const searchQuery = ref('')
const selectedComponent = ref('button')
const selectedArea = ref<'base' | 'slot' | 'state'>('state')
const selectedSlot = ref('leading')
const selectedState = ref('hover')

const componentDefinitions = computed(() => getComponentThemeEditorDefinitions(props.palette.components))
const hasComponents = computed(() => Object.keys(props.palette.components ?? {}).length > 0)
const componentOptions = computed(() => componentDefinitions.value.map(definition => ({
  label: definition.label,
  value: definition.value,
})))

const activeDefinition = computed(() => {
  return componentDefinitions.value.find(definition => definition.value === selectedComponent.value) ?? componentDefinitions.value[0]
})

const availableAreas = computed(() => {
  const definition = activeDefinition.value

  if (!definition) {
    return []
  }

  const areas = definition.areas

  return areas.map(area => ({
    label: formatPaletteLabel(area),
    value: area,
  }))
})

const availableSlots = computed(() => activeDefinition.value?.slots.map(slot => ({
  label: formatPaletteLabel(slot),
  value: slot,
})) ?? [])

const availableStates = computed(() => getComponentThemeStateNames(props.palette.components).map(state => ({
  label: formatPaletteLabel(state),
  value: state,
})))

const activeTokenGroup = computed(() => {
  return getComponentThemeTokenGroup(props.palette.components?.[selectedComponent.value], selectedArea.value, {
    slot: selectedSlot.value,
    state: selectedState.value,
  })
})

function isFlatClassTokenGroup(tokenGroup: Record<string, string | null | undefined>) {
  const keys = Object.keys(tokenGroup)
  return keys.length === 1 && keys[0] === 'class'
}

const isFlatClassString = computed(() => {
  return isFlatClassTokenGroup(activeTokenGroup.value)
})

function getFilteredTokenKeysForGroup(tokenGroup: Record<string, string | null | undefined>) {
  if (isFlatClassTokenGroup(tokenGroup)) {
    return []
  }

  const query = searchQuery.value.trim().toLowerCase()
  const configuredTokenKeys = Object.keys(tokenGroup)
  const tokenKeys = [...new Set([...suggestedTokenKeys.value, ...configuredTokenKeys])]

  if (!query) {
    return tokenKeys
  }

  return tokenKeys.filter(tokenKey => tokenKey.toLowerCase().includes(query))
}

function getFlatClassValueFromGroup(tokenGroup: Record<string, string | null | undefined>) {
  return isFlatClassTokenGroup(tokenGroup) ? (tokenGroup.class ?? '') : ''
}

const flatClassValue = computed(() => {
  return getFlatClassValueFromGroup(activeTokenGroup.value)
})

const themeColorOptions = computed(() => {
  const optionSuffixes = ['', '/10', '/15', '/25', '/50', '/75']
  const sectionEntries = [
    ['color', props.palette.modes.light.color ?? {}, 'Semantic'],
    ['bg', props.palette.modes.light.bg ?? {}, 'Surface'],
    ['text', props.palette.modes.light.text ?? {}, 'Text'],
    ['ui', props.palette.modes.light.ui ?? {}, 'UI'],
  ] as const

  return sectionEntries.flatMap(([section, tokens, labelPrefix]) => Object.entries(tokens)
    .filter(([, tokenValue]) => Boolean(tokenValue))
    .flatMap(([tokenKey, tokenValue]) => {
      const variableName = section === 'color' || section === 'ui'
        ? `var(--ui-${tokenKey})`
        : tokenKey === 'default'
          ? `var(--ui-${section})`
          : `var(--ui-${section}-${tokenKey})`

      return optionSuffixes.map((suffix) => ({
        label: `${labelPrefix} ${formatPaletteLabel(tokenKey)}${suffix ? ` ${suffix.slice(1)}%` : ''} · ${tokenValue}`,
        value: `${variableName}${suffix}`,
      }))
    }))
})

function shouldUseThemeColorSelect(tokenKey: string) {
  return ['bg', 'text', 'border', 'ring'].includes(tokenKey)
}

function getThemeColorOptions(currentValue: string | null | undefined) {
  if (!currentValue || themeColorOptions.value.some(option => option.value === currentValue)) {
    return themeColorOptions.value
  }

  return [{
    label: `Current · ${currentValue}`,
    value: currentValue,
  }, ...themeColorOptions.value]
}

const currentScopeLabel = computed(() => {
  return [activeDefinition.value?.label, selectedArea.value === 'slot'
    ? formatPaletteLabel(selectedSlot.value)
    : selectedArea.value === 'state'
      ? formatPaletteLabel(selectedState.value)
      : 'Base'].filter(Boolean).join(' / ')
})

const suggestedTokenKeys = computed(() => {
  const definition = activeDefinition.value

  if (!definition) {
    return []
  }

  return definition.tokenSuggestions[selectedArea.value] ?? []
})

const filteredTokenKeys = computed(() => getFilteredTokenKeysForGroup(activeTokenGroup.value))

const resolvedTitle = computed(() => {
  if (props.title) {
    return props.title
  }

  return 'Component states'
})

const resolvedDescription = computed(() => {
  if (props.description) {
    return props.description
  }

  return 'Tune hover, focus, active and disabled behavior without editing raw JSON.'
})

const resolvedEmptyTitle = computed(() => {
  if (props.emptyTitle) {
    return props.emptyTitle
  }

  return 'No component overrides yet'
})

const resolvedEmptyDescription = computed(() => {
  if (props.emptyDescription) {
    return props.emptyDescription
  }

  return 'Generate or create component overrides first, then manage their states here.'
})

watchEffect(() => {
  if (!componentOptions.value.length) {
    return
  }

  if (!componentOptions.value.some(option => option.value === selectedComponent.value)) {
    selectedComponent.value = componentOptions.value[0]!.value
  }
})

watchEffect(() => {
  if (!availableAreas.value.length) {
    return
  }

  if (!availableAreas.value.some(option => option.value === selectedArea.value)) {
    selectedArea.value = availableAreas.value[0]!.value as typeof selectedArea.value
  }
})

watchEffect(() => {
  if (availableSlots.value.length && !availableSlots.value.some(option => option.value === selectedSlot.value)) {
    selectedSlot.value = availableSlots.value[0]!.value
  }

  if (availableStates.value.length && !availableStates.value.some(option => option.value === selectedState.value)) {
    selectedState.value = availableStates.value[0]!.value
  }
})

watch(() => focusTarget.value.requestId, () => {
  if (focusTarget.value.area !== 'state') {
    return
  }

  selectedComponent.value = focusTarget.value.component
  selectedArea.value = 'state'

  if (focusTarget.value.slot) {
    selectedSlot.value = focusTarget.value.slot
  }

  if (focusTarget.value.state) {
    selectedState.value = focusTarget.value.state
  }
})

function updateToken(
  token: string,
  value: string | number | undefined,
  options: {
    area?: 'base' | 'slot' | 'state'
    slot?: string
    state?: string
  } = {},
) {
  const area = options.area ?? selectedArea.value

  emit('update-component-token', {
    component: selectedComponent.value,
    area,
    token,
    value: normalizePaletteTokenValue(value),
    slot: area === 'slot' ? (options.slot ?? selectedSlot.value) : undefined,
    state: area === 'state' ? (options.state ?? selectedState.value) : undefined,
  })
}

function updateFlatClassValue(value: string) {
  updateToken('class', value)
}
</script>

<template>
  <UCard variant="outline">
    <template v-if="!hideHeader" #header>
      <div class="space-y-1">
        <p class="text-sm font-medium dark:text-white">
          {{ resolvedTitle }}
        </p>
        <p class="text-xs text-muted">
          {{ resolvedDescription }}
        </p>
      </div>
    </template>

    <div v-if="!hasComponents" class="space-y-4">
      <div class="flex flex-col items-center justify-center rounded-xl border border-dashed border-default/60 bg-muted/10 px-6 py-12 text-center">
        <UIcon name="i-lucide-package" class="mb-4 size-12 text-muted" />
        <h3 class="mb-2 font-semibold dark:text-white">
          {{ resolvedEmptyTitle }}
        </h3>
        <p class="mb-6 max-w-sm text-sm text-muted">
          {{ resolvedEmptyDescription }}
        </p>
      </div>
    </div>

    <div v-else class="space-y-5">
      <div class="grid gap-3 md:grid-cols-2">
        <UFormField label="Component">
          <USelect
            v-model="selectedComponent"
            :items="componentOptions"
            value-key="value"
            color="neutral"
            variant="outline"
          />
        </UFormField>

        <UFormField label="State group">
          <USelect
            v-model="selectedArea"
            :items="availableAreas"
            value-key="value"
            color="neutral"
            variant="outline"
            disabled
          />
        </UFormField>

        <UFormField v-if="selectedArea === 'slot'" label="Slot">
          <USelect
            v-model="selectedSlot"
            :items="availableSlots"
            value-key="value"
            color="neutral"
            variant="outline"
          />
        </UFormField>

        <UFormField v-if="selectedArea === 'state'" label="State">
          <USelect
            v-model="selectedState"
            :items="availableStates"
            value-key="value"
            color="neutral"
            variant="outline"
          />
        </UFormField>

        <UFormField v-if="!isFlatClassString" label="Filter tokens">
          <UInput
            v-model="searchQuery"
            icon="i-lucide-search"
            placeholder="bg, ring, shadow..."
          />
        </UFormField>
      </div>

      <div class="flex flex-wrap items-center gap-2 rounded-xl border border-default/60 bg-muted/20 px-3 py-2 text-xs text-muted">
        <UBadge color="neutral" variant="soft">
          {{ currentScopeLabel }}
        </UBadge>
        <UBadge v-if="!isFlatClassString" color="neutral" variant="soft">
          {{ filteredTokenKeys.length }} tokens
        </UBadge>
        <UBadge v-if="isFlatClassString" color="primary" variant="soft">
          Class string
        </UBadge>
        <span v-if="!isFlatClassString">
          Configured values: {{ Object.keys(activeTokenGroup).length }}
        </span>
      </div>

      <div v-if="isFlatClassString" class="space-y-3">
        <div class="rounded-lg bg-primary/5 p-3 text-xs text-muted">
          <p class="mb-1 font-medium dark:text-white">
            Editing AI-generated class string
          </p>
          <p>
            This component uses Nuxt UI's class string format. Edit the Tailwind classes directly or convert them to token groups later for granular control.
          </p>
        </div>

        <UFormField label="Tailwind classes">
          <UTextarea
            :model-value="flatClassValue"
            placeholder="e.g., rounded-lg bg-primary text-white px-4 py-2"
            :rows="3"
            @update:model-value="updateFlatClassValue"
          />
        </UFormField>
      </div>

      <div v-else-if="filteredTokenKeys.length" class="grid gap-3 md:grid-cols-2">
        <UFormField
          v-for="tokenKey in filteredTokenKeys"
          :key="`${selectedComponent}-${selectedArea}-${tokenKey}`"
          :label="formatPaletteLabel(tokenKey)"
        >
          <USelect
            v-if="shouldUseThemeColorSelect(tokenKey)"
            :model-value="activeTokenGroup[tokenKey] ?? undefined"
            :items="getThemeColorOptions(activeTokenGroup[tokenKey])"
            value-key="value"
            color="neutral"
            variant="outline"
            @update:model-value="updateToken(tokenKey, typeof $event === 'string' ? $event : undefined)"
          />

          <UInput
            v-else
            :model-value="activeTokenGroup[tokenKey] ?? ''"
            :placeholder="`Set ${tokenKey}`"
            @update:model-value="updateToken(tokenKey, $event)"
          />
        </UFormField>
      </div>

      <div
        v-else
        class="rounded-xl border border-dashed border-default/60 bg-muted/10 px-4 py-6 text-sm text-muted"
      >
        No tokens match the current filter for this component scope.
      </div>
    </div>
  </UCard>
</template>
