<script setup lang="ts">
import { toRef } from 'vue'
import type { EditablePalette } from '~/types/palette-editor'
import { useThemeAiModal } from '~/composables/useThemeAiModal'

const props = defineProps<{
  palette: EditablePalette | null
  initialTab?: 'starter' | 'directions' | 'ramps' | 'variants'
}>()

const open = defineModel<boolean>('open', { default: false })

const {
  activeTab,
  cta,
  helperText,
  isDisabled,
  hasPalette,
  starterPrompt,
  starterReferenceSummary,
  starterBrandColors,
  starterBrandInput,
  starterReferenceImage,
  directionsPrompt,
  rampsPrompt,
  variantsPrompt,
  directionsCount,
  rampBrandColors,
  rampInput,
  selectedVariantComponents,
  isDirectionsLoading,
  isRampsLoading,
  isVariantsLoading,
  isStarterLoading,
  starterResult,
  directionsResult,
  rampsResult,
  variantsResult,
  starterHistory,
  directionsHistory,
  rampsHistory,
  variantsHistory,
  canGenerateStarter,
  canGenerateRamps,
  canGenerateVariants,
  componentOptions,
  rampPreviewPalette,
  variantPreviewPalette,
  clearStarterResult,
  clearDirectionsResult,
  clearRampsResult,
  clearVariantsResult,
  addStarterBrandColor,
  removeStarterBrandColor,
  clearStarterReferenceImage,
  handleStarterImageUpload,
  handleStarterTheme,
  handleDirections,
  addRampBrandColor,
  removeRampBrandColor,
  handleRamps,
  handleVariants,
  applyStarterSuggestion,
  applyDirectionSuggestion,
  applyRampSuggestion,
  applyVariantSuggestion,
  selectHistoryResult,
} = useThemeAiModal(open, toRef(props, 'palette'))

watch(open, (value) => {
  if (!value || !props.initialTab) {
    return
  }

  activeTab.value = props.initialTab
})
</script>

<template>
  <UModal
    v-model:open="open"
    title="AI Theme Assist"
    description="Generate starter themes, color ramps, variants, and alternative directions from the current palette."
    :ui="{ content: 'sm:max-w-5xl' }"
  >
    <template #body>
      <div class="space-y-4">
        <UAlert
          v-if="isDisabled"
          color="warning"
          variant="soft"
          icon="i-lucide-sparkles"
          title="AI assistance unavailable"
          :description="helperText"
        >
          <template #actions>
            <UButton
              v-if="cta"
              :to="cta.to"
              size="sm"
              color="warning"
              variant="soft"
            >
              {{ cta.label }}
            </UButton>
          </template>
        </UAlert>

        <UAlert
          v-else-if="!hasPalette"
          color="neutral"
          variant="soft"
          icon="i-lucide-palette"
          title="No palette loaded"
          description="Load or create a palette before using AI assist."
        />

        <UTabs
          v-model="activeTab"
          :items="[
            { label: 'Starter', value: 'starter', slot: 'starter' },
            { label: 'Ramps', value: 'ramps', slot: 'ramps' },
            { label: 'Variants', value: 'variants', slot: 'variants' },
            { label: 'Directions', value: 'directions', slot: 'directions' },
          ]"
          color="neutral"
          variant="link"
          :ui="{ root: 'space-y-4', list: 'w-full border-b border-default/60' }"
        >
          <template #starter>
            <ThemeAiStarterTab
              :palette="props.palette"
              :prompt="starterPrompt"
              :reference-summary="starterReferenceSummary"
              :brand-colors="starterBrandColors"
              :brand-input="starterBrandInput"
              :reference-image="starterReferenceImage"
              :can-generate="canGenerateStarter"
              :is-loading="isStarterLoading"
              :result="starterResult"
              :history="starterHistory"
              @update:prompt="starterPrompt = $event"
              @update:reference-summary="starterReferenceSummary = $event"
              @update:brand-input="starterBrandInput = $event"
              @add-brand-color="addStarterBrandColor()"
              @remove-brand-color="removeStarterBrandColor($event)"
              @upload-image="handleStarterImageUpload($event)"
              @clear-image="clearStarterReferenceImage()"
              @clear-form="starterPrompt = ''; starterReferenceSummary = ''; starterBrandColors = []; starterBrandInput = ''; clearStarterReferenceImage(); clearStarterResult()"
              @generate="handleStarterTheme()"
              @clear-result="clearStarterResult()"
              @select-history="starterResult = selectHistoryResult(starterHistory, $event)"
              @apply-result="applyStarterSuggestion($event)"
            />
          </template>

          <template #ramps>
            <ThemeAiRampsTab
              :palette="props.palette"
              :prompt="rampsPrompt"
              :brand-colors="rampBrandColors"
              :brand-input="rampInput"
              :can-generate="canGenerateRamps"
              :is-loading="isRampsLoading"
              :result="rampsResult"
              :history="rampsHistory"
              :preview-palette="rampPreviewPalette"
              @update:prompt="rampsPrompt = $event"
              @update:brand-input="rampInput = $event"
              @add-brand-color="addRampBrandColor()"
              @remove-brand-color="removeRampBrandColor($event)"
              @clear="rampBrandColors = []; rampInput = ''; rampsPrompt = ''; clearRampsResult()"
              @generate="handleRamps()"
              @clear-result="clearRampsResult()"
              @select-history="rampsResult = selectHistoryResult(rampsHistory, $event)"
              @apply="applyRampSuggestion()"
            />
          </template>

          <template #variants>
            <ThemeAiVariantsTab
              :palette="props.palette"
              :prompt="variantsPrompt"
              :selected-components="selectedVariantComponents"
              :component-options="componentOptions"
              :can-generate="canGenerateVariants"
              :is-loading="isVariantsLoading"
              :result="variantsResult"
              :history="variantsHistory"
              :preview-palette="variantPreviewPalette"
              @update:prompt="variantsPrompt = $event"
              @update:selected-components="selectedVariantComponents = $event"
              @reset="selectedVariantComponents = ['button', 'input', 'card']; variantsPrompt = ''; clearVariantsResult()"
              @generate="handleVariants()"
              @clear-result="clearVariantsResult()"
              @select-history="variantsResult = selectHistoryResult(variantsHistory, $event)"
              @apply="applyVariantSuggestion()"
            />
          </template>

          <template #directions>
            <ThemeAiDirectionsTab
              :palette="props.palette"
              :prompt="directionsPrompt"
              :count="directionsCount"
              :is-disabled="isDisabled"
              :is-loading="isDirectionsLoading"
              :result="directionsResult"
              :history="directionsHistory"
              @update:prompt="directionsPrompt = $event"
              @update:count="directionsCount = $event"
              @reset="directionsPrompt = ''; directionsCount = 3; clearDirectionsResult()"
              @generate="handleDirections()"
              @select-history="directionsResult = selectHistoryResult(directionsHistory, $event)"
              @apply-direction="applyDirectionSuggestion($event)"
            />
          </template>
        </UTabs>
      </div>
    </template>
  </UModal>
</template>
