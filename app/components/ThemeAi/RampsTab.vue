<script setup lang="ts">
import type { EditablePalette } from '~/types/palette-editor'
import type { PaletteDefinition } from '~/types/palette'
import type {
  PaletteAiResultHistoryEntry,
  PaletteRampGenerateResult,
} from '~/types/palette-generation'
import { clonePaletteDefinition } from '~/utils/palette-domain'

const props = defineProps<{
  palette: EditablePalette | null
  prompt: string
  brandColors: string[]
  brandInput: string
  canGenerate: boolean
  isLoading: boolean
  result: PaletteRampGenerateResult | null
  history: PaletteAiResultHistoryEntry<PaletteRampGenerateResult>[]
  previewPalette: PaletteDefinition | null
}>()

const emit = defineEmits<{
  'update:prompt': [value: string]
  'update:brandInput': [value: string]
  'add-brand-color': []
  'remove-brand-color': [color: string]
  clear: []
  generate: []
  'clear-result': []
  'select-history': [id: number]
  apply: []
}>()

const selectedHistoryId = computed(() => props.history.find(entry => entry.result === props.result)?.id ?? null)
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
    <UCard variant="outline">
      <template #header>
        <ThemeAiSectionHeader
          title="Brand color ramps"
          description="Generate full scales from one or more brand anchors and sync their `500` values into semantic colors."
          :action-label="result || brandColors.length || brandInput || prompt ? 'Clear' : undefined"
          @action="emit('clear')"
        />
      </template>

      <div class="space-y-4">
        <UInput
          :model-value="brandInput"
          placeholder="#0ea5e9"
          @update:model-value="emit('update:brandInput', String($event))"
          @keydown.enter.prevent="emit('add-brand-color')"
        >
          <template #trailing>
            <UButton
              color="primary"
              variant="link"
              class="px-0"
              :disabled="!brandInput.trim()"
              @click="emit('add-brand-color')"
            >
              Add
            </UButton>
          </template>
        </UInput>

        <p class="text-xs text-muted">
          Add one or more hex colors. Invalid and duplicate anchors are blocked before generation.
        </p>

        <div class="flex flex-wrap gap-2">
          <UBadge
            v-for="color in brandColors"
            :key="color"
            color="neutral"
            variant="soft"
            class="gap-2"
          >
            <span class="h-3 w-3 rounded-full border border-black/10" :style="{ backgroundColor: color }" />
            {{ color }}
            <button type="button" class="leading-none" @click="emit('remove-brand-color', color)">x</button>
          </UBadge>
        </div>

        <UTextarea
          :model-value="prompt"
          :rows="4"
          class="w-full"
          placeholder="Example: Keep the ramps crisp and technical, with lighter steps that work well for data-heavy surfaces."
          @update:model-value="emit('update:prompt', String($event))"
        />

        <UButton
          block
          color="primary"
          icon="i-lucide-pipette"
          :disabled="!canGenerate"
          :loading="isLoading"
          @click="emit('generate')"
        >
          Generate ramps
        </UButton>
      </div>
    </UCard>

    <UCard variant="outline">
      <template #header>
        <ThemeAiSectionHeader
          title="Ramp preview"
          description="Review the generated scales before applying them to the current draft."
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

        <div
          v-for="(scale, colorKey) in result.ramps"
          :key="colorKey"
          class="space-y-2"
        >
          <p class="text-sm font-medium text-highlighted">
            {{ colorKey }}
          </p>

          <div class="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-6">
            <div
              v-for="(value, step) in scale"
              :key="`${colorKey}-${step}`"
              class="rounded-xl border border-default/60 p-2"
            >
              <div class="h-10 rounded-lg border border-black/10" :style="{ backgroundColor: value ?? 'transparent' }" />
              <p class="mt-2 text-xs font-medium text-highlighted">{{ step }}</p>
              <p class="text-[11px] text-muted">{{ value }}</p>
            </div>
          </div>
        </div>

        <ThemeAiComparison
          v-if="palette && previewPalette"
          :from-palette="clonePaletteDefinition(palette)"
          :to-palette="previewPalette"
          title="Ramp diff"
        />

        <ThemeAiLivePreview
          v-if="previewPalette"
          :palette="previewPalette"
          title="Ramp preview"
        />

        <UButton
          block
          color="primary"
          icon="i-lucide-check"
          @click="emit('apply')"
        >
          Apply ramps
        </UButton>
      </div>

      <div
        v-else
        class="rounded -lg border border-dashed border-default/70 px-4 py-10 text-center text-sm text-muted"
      >
        Add one or more brand colors to generate full ramps.
      </div>
    </UCard>
  </div>
</template>
