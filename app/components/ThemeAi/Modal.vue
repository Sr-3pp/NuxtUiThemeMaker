<script setup lang="ts">
import type { EditablePalette } from '~/types/palette-editor'
import type { PaletteDefinition } from '~/types/palette'
import type {
  PaletteAuditGenerateResult,
  PaletteDirectionsGenerateResult,
} from '~/types/palette-generation'
import { clonePaletteDefinition } from '~/utils/palette-domain'

const props = defineProps<{
  palette: EditablePalette | null
}>()

const open = defineModel<boolean>('open', { default: false })

const toast = useToast()
const { showErrorToast } = useErrorToast()
const { generatePaletteAudit, generatePaletteDirections } = usePaletteApi()
const { applyGeneratedPalette } = usePaletteState()
const { cta, helperText, isDisabled, refresh } = usePaletteGenerationAccess()

const activeTab = ref<'audit' | 'directions'>('audit')
const auditPrompt = ref('')
const directionsPrompt = ref('')
const directionsCount = ref<1 | 2 | 3>(3)
const isAuditLoading = ref(false)
const isDirectionsLoading = ref(false)
const auditResult = ref<PaletteAuditGenerateResult | null>(null)
const directionsResult = ref<PaletteDirectionsGenerateResult | null>(null)

const hasPalette = computed(() => Boolean(props.palette))

watch(open, (value) => {
  if (!value) {
    activeTab.value = 'audit'
    return
  }

  auditResult.value = null
  directionsResult.value = null
}, { immediate: false })

watch(() => props.palette?.name, () => {
  auditResult.value = null
  directionsResult.value = null
})

async function handleAudit() {
  if (!props.palette || isDisabled.value || isAuditLoading.value) {
    return
  }

  isAuditLoading.value = true

  try {
    auditResult.value = await generatePaletteAudit({
      palette: clonePaletteDefinition(props.palette),
      prompt: auditPrompt.value.trim() || undefined,
    })
  } catch (error) {
    showErrorToast(error, 'Failed to generate an AI repair pass.')
    await refresh()
  } finally {
    isAuditLoading.value = false
  }
}

async function handleDirections() {
  if (!props.palette || isDisabled.value || isDirectionsLoading.value) {
    return
  }

  isDirectionsLoading.value = true

  try {
    directionsResult.value = await generatePaletteDirections({
      palette: clonePaletteDefinition(props.palette),
      prompt: directionsPrompt.value.trim() || undefined,
      count: directionsCount.value,
    })
  } catch (error) {
    showErrorToast(error, 'Failed to generate alternative directions.')
    await refresh()
  } finally {
    isDirectionsLoading.value = false
  }
}

function applyPaletteSuggestion(palette: PaletteDefinition, message: string) {
  applyGeneratedPalette(palette)
  toast.add({
    title: 'Palette updated',
    description: message,
    color: 'success',
  })
  open.value = false
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="AI Theme Assist"
    description="Repair accessibility issues or generate alternative directions from the current palette."
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
            { label: 'Audit', value: 'audit', slot: 'audit' },
            { label: 'Directions', value: 'directions', slot: 'directions' },
          ]"
          color="neutral"
          variant="link"
          :ui="{ root: 'space-y-4', list: 'w-full border-b border-default/60' }"
        >
          <template #audit>
            <div class="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <UCard variant="outline" class="rounded-2xl shadow-none">
                <template #header>
                  <div class="space-y-1">
                    <p class="text-sm font-medium text-highlighted">
                      Repair prompt
                    </p>
                    <p class="text-xs text-muted">
                      Ask the model to prioritize contrast, focus rings, muted text, or publish readiness.
                    </p>
                  </div>
                </template>

                <div class="space-y-4">
                  <UTextarea
                    v-model="auditPrompt"
                    :rows="6"
                    class="w-full"
                    placeholder="Example: Strengthen body copy contrast, preserve the brand blue, and make focus states more obvious."
                  />

                  <UButton
                    block
                    color="primary"
                    icon="i-lucide-wand-sparkles"
                    :disabled="!hasPalette || isDisabled"
                    :loading="isAuditLoading"
                    @click="handleAudit()"
                  >
                    Generate AI repair
                  </UButton>
                </div>
              </UCard>

              <UCard variant="outline" class="rounded-2xl shadow-none">
                <template #header>
                  <div class="space-y-1">
                    <p class="text-sm font-medium text-highlighted">
                      Suggested fixes
                    </p>
                    <p class="text-xs text-muted">
                      Review the token-level changes before applying the patched palette.
                    </p>
                  </div>
                </template>

                <div
                  v-if="auditResult"
                  class="space-y-4"
                >
                  <div class="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                    <p class="text-sm font-medium text-highlighted">
                      {{ auditResult.summary }}
                    </p>
                  </div>

                  <div class="space-y-2">
                    <div
                      v-for="fix in auditResult.fixes"
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
                    @click="applyPaletteSuggestion(auditResult.patchedPalette, 'Applied the AI repair pass to the current draft.')"
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

          <template #directions>
            <div class="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <UCard variant="outline" class="rounded-2xl shadow-none">
                <template #header>
                  <div class="space-y-1">
                    <p class="text-sm font-medium text-highlighted">
                      Direction brief
                    </p>
                    <p class="text-xs text-muted">
                      Push the current palette toward new art directions without starting over.
                    </p>
                  </div>
                </template>

                <div class="space-y-4">
                  <UTextarea
                    v-model="directionsPrompt"
                    :rows="6"
                    class="w-full"
                    placeholder="Example: Explore one more editorial option, one more enterprise option, and one darker command-center option."
                  />

                  <div class="space-y-2">
                    <p class="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                      Number of directions
                    </p>
                    <div class="flex flex-wrap gap-2">
                      <UButton
                        v-for="count in [1, 2, 3]"
                        :key="count"
                        :color="directionsCount === count ? 'primary' : 'neutral'"
                        :variant="directionsCount === count ? 'solid' : 'outline'"
                        size="sm"
                        @click="directionsCount = count as 1 | 2 | 3"
                      >
                        {{ count }}
                      </UButton>
                    </div>
                  </div>

                  <UButton
                    block
                    color="primary"
                    icon="i-lucide-sparkles"
                    :disabled="!hasPalette || isDisabled"
                    :loading="isDirectionsLoading"
                    @click="handleDirections()"
                  >
                    Generate directions
                  </UButton>
                </div>
              </UCard>

              <div class="space-y-3">
                <UCard
                  v-for="direction in directionsResult?.directions ?? []"
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
                        @click="applyPaletteSuggestion(direction.palette, `Applied the ${direction.name} direction to the current draft.`)"
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
                </UCard>

                <div
                  v-if="!directionsResult"
                  class="rounded-2xl border border-dashed border-default/70 px-4 py-10 text-center text-sm text-muted"
                >
                  Generate directions to compare alternate takes on the current palette.
                </div>
              </div>
            </div>
          </template>
        </UTabs>
      </div>
    </template>
  </UModal>
</template>
