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
  mode?: 'components' | 'states'
  palette: PaletteDefinition
}>(), {
  mode: 'components',
})

const emit = defineEmits<{
  'update-component-token': [payload: UpdatePaletteComponentTokenPayload]
}>()

const modal = useModal('theme-ai-modal')
const searchQuery = ref('')
const selectedComponent = ref('button')
const selectedArea = ref<'base' | 'slot' | 'variant' | 'state'>('base')
const selectedVariant = ref('solid')
const selectedVariantColor = ref('primary')
const selectedSlot = ref('leading')
const selectedState = ref('hover')

const componentDefinitions = computed(() => getComponentThemeEditorDefinitions(props.palette.components))
const hasComponents = computed(() => Object.keys(props.palette.components ?? {}).length > 0)
const componentOptions = computed(() => componentDefinitions.value.map(definition => ({
  label: definition.label,
  value: definition.value,
})))

function openAiModal() {
  modal.open()
}

const activeDefinition = computed(() => {
  return componentDefinitions.value.find(definition => definition.value === selectedComponent.value) ?? componentDefinitions.value[0]
})

const availableAreas = computed(() => {
  const definition = activeDefinition.value

  if (!definition) {
    return []
  }

  const areas = props.mode === 'states'
    ? definition.areas.filter(area => area === 'state')
    : definition.areas.filter(area => area !== 'state')

  return areas.map(area => ({
    label: formatPaletteLabel(area),
    value: area,
  }))
})

const availableVariants = computed(() => activeDefinition.value?.variants.map(variant => ({
  label: formatPaletteLabel(variant),
  value: variant,
})) ?? [])

const availableVariantColors = computed(() => {
  const semanticColors = Object.keys(props.palette.colors ?? {})

  return [...new Set([
    ...(activeDefinition.value?.variantColors ?? []),
    ...semanticColors,
  ])].map(color => ({
    label: formatPaletteLabel(color),
    value: color,
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
    variant: selectedVariant.value,
    variantColor: selectedVariantColor.value,
    state: selectedState.value,
  })
})

// Check if current value is a Nuxt UI flat class string (normalized to { class: "..." })
const isFlatClassString = computed(() => {
  const keys = Object.keys(activeTokenGroup.value)
  return keys.length === 1 && keys[0] === 'class'
})

// Get the actual flat string value or empty string
const flatClassValue = computed(() => {
  return isFlatClassString.value ? (activeTokenGroup.value.class ?? '') : ''
})

const suggestedTokenKeys = computed(() => {
  const definition = activeDefinition.value

  if (!definition) {
    return []
  }

  return definition.tokenSuggestions[selectedArea.value] ?? []
})

const filteredTokenKeys = computed(() => {
  // If it's a flat class string, don't show individual token inputs
  if (isFlatClassString.value) {
    return []
  }

  const query = searchQuery.value.trim().toLowerCase()
  const configuredTokenKeys = Object.keys(activeTokenGroup.value)
  const tokenKeys = [...new Set([...suggestedTokenKeys.value, ...configuredTokenKeys])]

  if (!query) {
    return tokenKeys
  }

  return tokenKeys.filter(tokenKey => tokenKey.toLowerCase().includes(query))
})

const currentScopeLabel = computed(() => {
  const parts = [activeDefinition.value?.label]

  if (selectedArea.value === 'variant') {
    parts.push(formatPaletteLabel(selectedVariant.value), formatPaletteLabel(selectedVariantColor.value))
  } else if (selectedArea.value === 'slot') {
    parts.push(formatPaletteLabel(selectedSlot.value))
  } else if (selectedArea.value === 'state') {
    parts.push(formatPaletteLabel(selectedState.value))
  } else {
    parts.push('Base')
  }

  return parts.filter(Boolean).join(' / ')
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
  if (availableVariants.value.length && !availableVariants.value.some(option => option.value === selectedVariant.value)) {
    selectedVariant.value = availableVariants.value[0]!.value
  }

  if (availableVariantColors.value.length && !availableVariantColors.value.some(option => option.value === selectedVariantColor.value)) {
    selectedVariantColor.value = availableVariantColors.value[0]!.value
  }

  if (availableSlots.value.length && !availableSlots.value.some(option => option.value === selectedSlot.value)) {
    selectedSlot.value = availableSlots.value[0]!.value
  }

  if (availableStates.value.length && !availableStates.value.some(option => option.value === selectedState.value)) {
    selectedState.value = availableStates.value[0]!.value
  }
})

function updateToken(token: string, value: string | number | undefined) {
  emit('update-component-token', {
    component: selectedComponent.value,
    area: selectedArea.value,
    token,
    value: normalizePaletteTokenValue(value),
    slot: selectedArea.value === 'slot' ? selectedSlot.value : undefined,
    variant: selectedArea.value === 'variant' ? selectedVariant.value : undefined,
    variantColor: selectedArea.value === 'variant' ? selectedVariantColor.value : undefined,
    state: selectedArea.value === 'state' ? selectedState.value : undefined,
  })
}

function updateFlatClassValue(value: string) {
  // Update the 'class' token which represents the flat string
  updateToken('class', value)
}
</script>

<template>
  <UCard variant="outline">
    <template #header>
      <div class="space-y-1">
        <p class="text-sm font-medium dark:text-white">
          {{ mode === 'states' ? 'Component states' : 'Component overrides' }}
        </p>
        <p class="text-xs text-muted">
          {{ mode === 'states'
            ? 'Tune hover, focus, active and disabled behavior without editing raw JSON.'
            : 'Edit component base, slot and variant tokens through the normalized theme schema.' }}
        </p>
      </div>
    </template>

    <!-- Empty state: No components yet -->
    <div v-if="!hasComponents" class="space-y-4">
      <div class="flex flex-col items-center justify-center rounded-xl border border-dashed border-default/60 bg-muted/10 px-6 py-12 text-center">
        <UIcon name="i-lucide-package" class="mb-4 size-12 text-muted" />
        <h3 class="mb-2 font-semibold dark:text-white">
          No component overrides yet
        </h3>
        <p class="mb-6 max-w-sm text-sm text-muted">
          {{ mode === 'states'
            ? 'Generate or create component overrides first, then manage their states here.'
            : 'Use AI to generate component variants, or manually add them to customize buttons, inputs, cards, and more.' }}
        </p>
        <UButton
          v-if="mode === 'components'"
          icon="i-lucide-sparkles"
          color="primary"
          @click="openAiModal"
        >
          Generate with AI
        </UButton>
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

        <UFormField :label="mode === 'states' ? 'State group' : 'Editor scope'">
          <USelect
            v-model="selectedArea"
            :items="availableAreas"
            value-key="value"
            color="neutral"
            variant="outline"
            :disabled="mode === 'states'"
          />
        </UFormField>

        <UFormField v-if="selectedArea === 'variant'" label="Variant">
          <USelect
            v-model="selectedVariant"
            :items="availableVariants"
            value-key="value"
            color="neutral"
            variant="outline"
          />
        </UFormField>

        <UFormField v-if="selectedArea === 'variant'" label="Variant color">
          <USelect
            v-model="selectedVariantColor"
            :items="availableVariantColors"
            value-key="value"
            color="neutral"
            variant="outline"
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

      <!-- Flat class string editor (AI-generated format) -->
      <div v-if="isFlatClassString" class="space-y-3">
        <div class="rounded-lg bg-primary/5 p-3 text-xs text-muted">
          <p class="mb-1 font-medium dark:text-white">
            💡 Editing AI-generated class string
          </p>
          <p>
            This component uses Nuxt UI's class string format. You can edit the Tailwind classes directly or convert to token format for granular control.
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

      <!-- Token object editor (granular format) -->
      <div v-else-if="filteredTokenKeys.length" class="grid gap-3 md:grid-cols-2">
        <UFormField
          v-for="tokenKey in filteredTokenKeys"
          :key="`${selectedComponent}-${selectedArea}-${tokenKey}`"
          :label="formatPaletteLabel(tokenKey)"
        >
          <UInput
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
