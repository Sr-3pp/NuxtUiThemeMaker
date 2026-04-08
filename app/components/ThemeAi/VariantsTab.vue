<script setup lang="ts">
import type { EditablePalette } from '~/types/palette-editor'
import type { PaletteDefinition } from '~/types/palette'
import type {
  PaletteAiResultHistoryEntry,
  PaletteVariantGenerateResult,
} from '~/types/palette-generation'
import { clonePaletteDefinition } from '~/utils/palette-domain'

const props = defineProps<{
  palette: EditablePalette | null
  prompt: string
  selectedComponents: string[]
  componentOptions: { label: string, value: string }[]
  canGenerate: boolean
  isLoading: boolean
  result: PaletteVariantGenerateResult | null
  history: PaletteAiResultHistoryEntry<PaletteVariantGenerateResult>[]
  previewPalette: PaletteDefinition | null
}>()

const emit = defineEmits<{
  'update:prompt': [value: string]
  'update:selectedComponents': [value: string[]]
  reset: []
  generate: []
  'clear-result': []
  'select-history': [id: number]
  apply: []
}>()

const selectedHistoryId = computed(() => props.history.find(entry => entry.result === props.result)?.id ?? null)
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
    <UCard variant="outline" class="rounded-2xl shadow-none">
      <template #header>
        <ThemeAiSectionHeader
          title="Variant brief"
          description="Generate component-level styling from a mood, product, or brand prompt."
          :action-label="result || prompt || selectedComponents.length !== 3 ? 'Reset' : undefined"
          @action="emit('reset')"
        />
      </template>

      <div class="space-y-4">
        <USelectMenu
          :model-value="selectedComponents"
          :items="componentOptions"
          multiple
          value-key="value"
          placeholder="Choose components"
          @update:model-value="emit('update:selectedComponents', $event as string[])"
        />

        <UTextarea
          :model-value="prompt"
          :rows="6"
          class="w-full"
          placeholder="Example: Give buttons and inputs a sharper B2B feel with quieter cards and stronger table hierarchy."
          @update:model-value="emit('update:prompt', String($event))"
        />

        <UButton
          block
          color="primary"
          icon="i-lucide-panels-top-left"
          :disabled="!canGenerate"
          :loading="isLoading"
          @click="emit('generate')"
        >
          Generate variants
        </UButton>
      </div>
    </UCard>

    <UCard variant="outline" class="rounded-2xl shadow-none">
      <template #header>
        <ThemeAiSectionHeader
          title="Generated component layer"
          description="Apply the generated overrides as a merge on top of the current component theme schema."
          :action-label="result ? 'Clear result' : undefined"
          @action="emit('clear-result')"
        />
      </template>

      <div
        v-if="result"
        class="space-y-4"
      >
        <ThemeAiHistory
          :entries="history"
          :selected-id="selectedHistoryId"
          @select="emit('select-history', $event)"
        />

        <div class="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
          <p class="text-sm font-medium text-highlighted">
            {{ result.summary }}
          </p>
        </div>

        <div
          v-for="(theme, componentKey) in result.components"
          :key="componentKey"
          class="rounded-xl border border-default/60 bg-muted/15 px-3 py-3"
        >
          <div class="flex flex-wrap items-center gap-2">
            <UBadge color="primary" variant="soft">
              {{ componentKey }}
            </UBadge>
            <UBadge v-if="theme.base" color="neutral" variant="outline">base</UBadge>
            <UBadge v-if="theme.slots" color="neutral" variant="outline">slots</UBadge>
            <UBadge v-if="theme.variants" color="neutral" variant="outline">variants</UBadge>
            <UBadge v-if="theme.states" color="neutral" variant="outline">states</UBadge>
          </div>
        </div>

        <ThemeAiComparison
          v-if="palette && previewPalette"
          :from-palette="clonePaletteDefinition(palette)"
          :to-palette="previewPalette"
          title="Variant diff"
        />

        <ThemeAiLivePreview
          v-if="previewPalette"
          :palette="previewPalette"
          title="Variant preview"
        />

        <UButton
          block
          color="primary"
          icon="i-lucide-check"
          @click="emit('apply')"
        >
          Apply component variants
        </UButton>
      </div>

      <div
        v-else
        class="rounded-2xl border border-dashed border-default/70 px-4 py-10 text-center text-sm text-muted"
      >
        Generate a component layer to preview and merge into the current draft.
      </div>
    </UCard>
  </div>
</template>
