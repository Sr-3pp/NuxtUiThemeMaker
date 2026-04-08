<script setup lang="ts">
import type {
  PaletteAiResultHistoryEntry,
  PaletteAuditGenerateResult,
} from '~/types/palette-generation'

const props = defineProps<{
  prompt: string
  hasPalette: boolean
  isDisabled: boolean
  isLoading: boolean
  result: PaletteAuditGenerateResult | null
  history: PaletteAiResultHistoryEntry<PaletteAuditGenerateResult>[]
}>()

const emit = defineEmits<{
  'update:prompt': [value: string]
  generate: []
  'clear-result': []
  'select-history': [id: number]
  apply: [palette: PaletteAuditGenerateResult['patchedPalette']]
}>()

const selectedHistoryId = computed(() => props.history.find(entry => entry.result === props.result)?.id ?? null)
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
    <UCard variant="outline" class="rounded-2xl shadow-none">
      <template #header>
        <ThemeAiSectionHeader
          title="Repair prompt"
          description="Ask the model to prioritize contrast, focus rings, muted text, or publish readiness."
        />
      </template>

      <div class="space-y-4">
        <UTextarea
          :model-value="prompt"
          :rows="6"
          class="w-full"
          placeholder="Example: Strengthen body copy contrast, preserve the brand blue, and make focus states more obvious."
          @update:model-value="emit('update:prompt', String($event))"
        />

        <UButton
          block
          color="primary"
          icon="i-lucide-wand-sparkles"
          :disabled="!hasPalette || isDisabled"
          :loading="isLoading"
          @click="emit('generate')"
        >
          Generate AI repair
        </UButton>
      </div>
    </UCard>

    <UCard variant="outline" class="rounded-2xl shadow-none">
      <template #header>
        <ThemeAiSectionHeader
          title="Suggested fixes"
          description="Review the token-level changes before applying the patched palette."
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

        <div class="space-y-2">
          <div
            v-for="fix in result.fixes"
            :key="`${fix.mode}-${fix.token}-${fix.suggestedValue}`"
            class="rounded-xl border border-default/60 bg-muted/15 px-3 py-3"
          >
            <div class="flex flex-wrap items-center gap-2">
              <UBadge color="neutral" variant="outline">{{ fix.mode }}</UBadge>
              <UBadge color="primary" variant="soft">{{ fix.token }}</UBadge>
            </div>
            <p class="mt-2 text-sm text-muted">
              {{ fix.reason }}
            </p>
            <p class="mt-2 text-xs text-muted">
              {{ fix.currentValue ?? 'unset' }} -> {{ fix.suggestedValue }}
            </p>
          </div>
        </div>

        <UButton
          block
          color="primary"
          icon="i-lucide-check"
          @click="emit('apply', result.patchedPalette)"
        >
          Apply patched palette
        </UButton>
      </div>

      <div
        v-else
        class="rounded-xl border border-dashed border-default/70 px-4 py-10 text-center text-sm text-muted"
      >
        Run an audit repair to get token suggestions and a patched draft.
      </div>
    </UCard>
  </div>
</template>
