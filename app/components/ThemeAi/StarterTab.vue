<script setup lang="ts">
import type { EditablePalette } from '~/types/palette-editor'
import type { PaletteDefinition } from '~/types/palette'
import type {
  PaletteAiResultHistoryEntry,
  PaletteReferenceImageAsset,
} from '~/types/palette-generation'
import { clonePaletteDefinition } from '~/utils/palette-domain'

const props = defineProps<{
  palette: EditablePalette | null
  prompt: string
  referenceSummary: string
  brandColors: string[]
  brandInput: string
  referenceImage: PaletteReferenceImageAsset | null
  canGenerate: boolean
  isLoading: boolean
  result: PaletteDefinition | null
  history: PaletteAiResultHistoryEntry<PaletteDefinition>[]
}>()

const emit = defineEmits<{
  'update:prompt': [value: string]
  'update:referenceSummary': [value: string]
  'update:brandInput': [value: string]
  'add-brand-color': []
  'remove-brand-color': [color: string]
  'upload-image': [event: Event]
  'clear-image': []
  'clear-form': []
  'generate': []
  'clear-result': []
  'select-history': [id: number]
  'apply-result': [palette: PaletteDefinition]
}>()

const selectedHistoryId = computed(() => props.history.find(entry => entry.result === props.result)?.id ?? null)
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
    <UCard variant="outline">
      <template #header>
        <ThemeAiSectionHeader
          title="Starter theme input"
          description="Generate a full palette from a prompt, optional brand colors, and an optional screenshot or style reference."
          :action-label="result || referenceImage || brandColors.length || referenceSummary || prompt ? 'Clear' : undefined"
          @action="emit('clear-form')"
        />
      </template>

      <div class="space-y-4">
        <UTextarea
          :model-value="prompt"
          :rows="4"
          class="w-full"
          placeholder="Example: Turn this fintech dashboard into a calm, data-dense Nuxt UI theme with strong call-to-actions."
          @update:model-value="emit('update:prompt', String($event))"
        />

        <UTextarea
          :model-value="referenceSummary"
          :rows="3"
          class="w-full"
          placeholder="Optional: summarize the reference style, surface treatment, or brand direction."
          @update:model-value="emit('update:referenceSummary', String($event))"
        />

        <div class="space-y-2">
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
            Add brand anchors as hex values. Duplicate and invalid colors are rejected before request.
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
        </div>

        <div class="space-y-2">
          <UFormField label="Reference image">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              class="block w-full text-sm text-muted"
              @change="emit('upload-image', $event)"
            >
          </UFormField>

          <p class="text-xs text-muted">
            Optional. PNG, JPEG, WEBP, or GIF up to 5 MB.
          </p>

          <UAlert
            v-if="referenceImage"
            color="neutral"
            variant="soft"
            icon="i-lucide-image"
            :title="referenceImage.name"
            :description="referenceImage.mimeType"
          >
            <template #actions>
              <UButton
                color="neutral"
                variant="soft"
                size="xs"
                @click="emit('clear-image')"
              >
                Remove
              </UButton>
            </template>
          </UAlert>
        </div>

        <UButton
          block
          color="primary"
          icon="i-lucide-image-plus"
          :disabled="!canGenerate"
          :loading="isLoading"
          @click="emit('generate')"
        >
          Generate starter theme
        </UButton>
      </div>
    </UCard>

    <UCard variant="outline">
      <template #header>
        <ThemeAiSectionHeader
          title="Generated starter palette"
          description="Apply the generated palette as the current draft."
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
            {{ result.name }}
          </p>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <div
            v-for="mode in ['light', 'dark']"
            :key="mode"
            class="rounded-xl border border-default/60 px-3 py-3"
          >
            <p class="text-xs uppercase tracking-[0.18em] text-muted">
              {{ mode }}
            </p>
            <div class="mt-3 flex flex-wrap gap-2">
              <div
                v-for="token in ['primary', 'secondary', 'success', 'warning', 'error']"
                :key="token"
                class="space-y-1"
              >
                <div
                  class="h-8 w-8 rounded-full border border-black/10"
                  :style="{ backgroundColor: result.modes[mode as 'light' | 'dark']?.color?.[token] ?? 'transparent' }"
                />
                <p class="text-[10px] uppercase tracking-[0.14em] text-muted">
                  {{ token }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <ThemeAiComparison
          v-if="palette"
          :from-palette="clonePaletteDefinition(palette)"
          :to-palette="result"
          title="Starter theme diff"
        />

        <ThemeAiLivePreview
          :palette="result"
          title="Starter theme preview"
        />

        <UButton
          block
          color="primary"
          icon="i-lucide-check"
          @click="emit('apply-result', result)"
        >
          Apply starter theme
        </UButton>
      </div>

      <div
        v-else
        class="rounded-xl border border-dashed border-default/70 px-4 py-10 text-center text-sm text-muted"
      >
        Add a prompt and optional references to generate a starter palette.
      </div>
    </UCard>
  </div>
</template>
