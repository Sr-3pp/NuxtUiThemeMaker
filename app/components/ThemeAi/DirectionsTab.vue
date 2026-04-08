<script setup lang="ts">
import type { EditablePalette } from '~/types/palette-editor'
import type { PaletteDefinition } from '~/types/palette'
import type { PaletteDirectionsGenerateResult } from '~/types/palette-generation'
import type { PaletteAiResultHistoryEntry } from '~/types/palette-generation'
import { clonePaletteDefinition } from '~/utils/palette-domain'

const props = defineProps<{
  palette: EditablePalette | null
  prompt: string
  count: 1 | 2 | 3
  isDisabled: boolean
  isLoading: boolean
  result: PaletteDirectionsGenerateResult | null
  history: PaletteAiResultHistoryEntry<PaletteDirectionsGenerateResult>[]
}>()

const emit = defineEmits<{
  'update:prompt': [value: string]
  'update:count': [value: 1 | 2 | 3]
  reset: []
  generate: []
  'select-history': [id: number]
  'apply-direction': [{ palette: PaletteDefinition, name: string }]
}>()

const selectedHistoryId = computed(() => props.history.find(entry => entry.result === props.result)?.id ?? null)
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
    <UCard variant="outline" class="rounded-2xl shadow-none">
      <template #header>
        <ThemeAiSectionHeader
          title="Direction brief"
          description="Push the current palette toward new art directions without starting over."
          :action-label="result || prompt || count !== 3 ? 'Reset' : undefined"
          @action="emit('reset')"
        />
      </template>

      <div class="space-y-4">
        <UTextarea
          :model-value="prompt"
          :rows="6"
          class="w-full"
          placeholder="Example: Explore one more editorial option, one more enterprise option, and one darker command-center option."
          @update:model-value="emit('update:prompt', String($event))"
        />

        <div class="space-y-2">
          <p class="text-xs font-medium uppercase tracking-[0.18em] text-muted">
            Number of directions
          </p>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="entryCount in [1, 2, 3]"
              :key="entryCount"
              :color="count === entryCount ? 'primary' : 'neutral'"
              :variant="count === entryCount ? 'solid' : 'outline'"
              size="sm"
              @click="emit('update:count', entryCount as 1 | 2 | 3)"
            >
              {{ entryCount }}
            </UButton>
          </div>
        </div>

        <UButton
          block
          color="primary"
          icon="i-lucide-sparkles"
          :disabled="!palette || isDisabled"
          :loading="isLoading"
          @click="emit('generate')"
        >
          Generate directions
        </UButton>
      </div>
    </UCard>

    <div class="space-y-3">
      <div
        v-if="history.length > 1"
        class="rounded-2xl border border-default/60 bg-muted/15 px-4 py-3"
      >
        <ThemeAiHistory
          :entries="history"
          :selected-id="selectedHistoryId"
          @select="emit('select-history', $event)"
        />
      </div>

      <UCard
        v-for="direction in result?.directions ?? []"
        :key="direction.name"
        variant="outline"
        class="rounded-2xl shadow-none"
      >
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-base font-semibold text-highlighted">
                {{ direction.name }}
              </p>
              <p class="mt-1 text-sm text-muted">
                {{ direction.rationale }}
              </p>
            </div>

            <UButton
              color="primary"
              variant="soft"
              size="sm"
              @click="emit('apply-direction', { palette: direction.palette, name: direction.name })"
            >
              Apply
            </UButton>
          </div>
        </template>

        <div class="grid gap-2 sm:grid-cols-2">
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
                  :style="{ backgroundColor: direction.palette.modes[mode as 'light' | 'dark']?.color?.[token] ?? 'transparent' }"
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
          :to-palette="direction.palette"
          :title="`${direction.name} diff`"
        />

        <ThemeAiLivePreview
          :palette="direction.palette"
          :title="`${direction.name} preview`"
        />
      </UCard>

      <div
        v-if="!result"
        class="rounded-2xl border border-dashed border-default/70 px-4 py-10 text-center text-sm text-muted"
      >
        Generate directions to compare alternate takes on the current palette.
      </div>
    </div>
  </div>
</template>
