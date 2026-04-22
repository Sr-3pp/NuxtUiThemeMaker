<script setup lang="ts">
import { toRef } from 'vue'
import type { EditablePalette } from '~/types/palette-editor'
import { useThemeAiModal } from '~/composables/useThemeAiModal'
import { type ThemeAiTab } from '../../utils/theme-ai-modal-config'

const props = defineProps<{
  palette: EditablePalette | null
  initialTab?: ThemeAiTab
}>()

const { isOpen: open } = useModal('theme-ai-modal')

const {
  activeTab,
  cta,
  helperText,
  isDisabled,
  hasPalette,
  starter,
  directions,
  ramps,
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
    description="Generate starter themes, color ramps, and alternative directions from the current palette."
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
          class="space-y-4"
          :items="[
            { label: 'Starter', value: 'starter', slot: 'starter' },
            { label: 'Ramps', value: 'ramps', slot: 'ramps' },
            { label: 'Directions', value: 'directions', slot: 'directions' },
          ]"
          color="neutral"
          variant="link"
        >
          <template #starter>
            <ThemeAiStarterTab
              :palette="props.palette"
              :prompt="starter.prompt"
              :reference-summary="starter.referenceSummary"
              :brand-colors="starter.brandColors"
              :brand-input="starter.brandInput"
              :reference-image="starter.referenceImage"
              :can-generate="starter.canGenerate"
              :is-loading="starter.isLoading"
              :result="starter.result"
              :history="starter.history"
              @update:prompt="starter.prompt = $event"
              @update:reference-summary="starter.referenceSummary = $event"
              @update:brand-input="starter.brandInput = $event"
              @add-brand-color="starter.addBrandColor()"
              @remove-brand-color="starter.removeBrandColor($event)"
              @upload-image="starter.uploadImage($event)"
              @clear-image="starter.clearReferenceImage()"
              @clear-form="starter.prompt = ''; starter.referenceSummary = ''; starter.brandColors = []; starter.brandInput = ''; starter.clearReferenceImage(); starter.clearResult()"
              @generate="starter.generate()"
              @clear-result="starter.clearResult()"
              @select-history="starter.result = selectHistoryResult(starter.history, $event)"
              @apply-result="starter.apply($event)"
            />
          </template>

          <template #ramps>
            <ThemeAiRampsTab
              :palette="props.palette"
              :prompt="ramps.prompt"
              :brand-colors="ramps.brandColors"
              :brand-input="ramps.brandInput"
              :can-generate="ramps.canGenerate"
              :is-loading="ramps.isLoading"
              :result="ramps.result"
              :history="ramps.history"
              :preview-palette="ramps.previewPalette"
              @update:prompt="ramps.prompt = $event"
              @update:brand-input="ramps.brandInput = $event"
              @add-brand-color="ramps.addBrandColor()"
              @remove-brand-color="ramps.removeBrandColor($event)"
              @clear="ramps.brandColors = []; ramps.brandInput = ''; ramps.prompt = ''; ramps.clearResult()"
              @generate="ramps.generate()"
              @clear-result="ramps.clearResult()"
              @select-history="ramps.result = selectHistoryResult(ramps.history, $event)"
              @apply="ramps.apply()"
            />
          </template>

          <template #directions>
            <ThemeAiDirectionsTab
              :palette="props.palette"
              :prompt="directions.prompt"
              :count="directions.count"
              :is-disabled="isDisabled"
              :is-loading="directions.isLoading"
              :result="directions.result"
              :history="directions.history"
              @update:prompt="directions.prompt = $event"
              @update:count="directions.count = $event"
              @reset="directions.prompt = ''; directions.count = 3; directions.clearResult()"
              @generate="directions.generate()"
              @select-history="directions.result = selectHistoryResult(directions.history, $event)"
              @apply-direction="directions.apply($event)"
            />
          </template>
        </UTabs>
      </div>
    </template>
  </UModal>
</template>
