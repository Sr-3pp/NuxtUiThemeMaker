<script setup lang="ts">
import type { Ref } from 'vue'
import type { EditablePalette } from '~/types/palette-editor'
import type { PaletteDefinition } from '~/types/palette'
import type {
  PaletteAiPersistedSession,
  PaletteAiResultHistoryEntry,
  PaletteAuditGenerateResult,
  PaletteDirectionsGenerateResult,
  PaletteRampGenerateResult,
  PaletteVariantGenerateResult,
} from '~/types/palette-generation'
import {
  clonePaletteDefinition,
  createPaletteWithGeneratedComponents,
  createPaletteWithGeneratedRamps,
} from '~/utils/palette-domain'
import {
  buildPaletteAiPersistedSession,
  createEmptyPersistedAiSession,
  restorePaletteAiSession,
} from '~/utils/palette-ai-session'
import { getComponentThemeEditorDefinitions } from '~/utils/component-theme-editor'

const props = defineProps<{
  palette: EditablePalette | null
}>()

const open = defineModel<boolean>('open', { default: false })

const toast = useToast()
const { showErrorToast } = useErrorToast()
const { generatePalette, generatePaletteAudit, generatePaletteDirections, generatePaletteRamps, generatePaletteVariants } = usePaletteApi()
const { applyGeneratedPalette, applyGeneratedComponents, applyGeneratedRamps } = usePaletteState()
const { cta, helperText, isDisabled, refresh } = usePaletteGenerationAccess()

const MAX_REFERENCE_IMAGE_BYTES = 5 * 1024 * 1024
const SUPPORTED_REFERENCE_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'] as const
const MAX_RESULT_HISTORY = 4

const activeTab = ref<'starter' | 'audit' | 'directions' | 'ramps' | 'variants'>('starter')
const starterPrompt = ref('')
const starterReferenceSummary = ref('')
const starterBrandColors = ref<string[]>([])
const starterBrandInput = ref('')
const starterReferenceImage = ref<{ data: string, mimeType: string, name: string } | null>(null)
const auditPrompt = ref('')
const directionsPrompt = ref('')
const rampsPrompt = ref('')
const variantsPrompt = ref('')
const directionsCount = ref<1 | 2 | 3>(3)
const rampBrandColors = ref<string[]>([])
const rampInput = ref('')
const selectedVariantComponents = ref<string[]>(['button', 'input', 'card'])
const isAuditLoading = ref(false)
const isDirectionsLoading = ref(false)
const isRampsLoading = ref(false)
const isVariantsLoading = ref(false)
const isStarterLoading = ref(false)
const starterResult = ref<PaletteDefinition | null>(null)
const auditResult = ref<PaletteAuditGenerateResult | null>(null)
const directionsResult = ref<PaletteDirectionsGenerateResult | null>(null)
const rampsResult = ref<PaletteRampGenerateResult | null>(null)
const variantsResult = ref<PaletteVariantGenerateResult | null>(null)
const starterHistory = ref<PaletteAiResultHistoryEntry<PaletteDefinition>[]>([])
const auditHistory = ref<PaletteAiResultHistoryEntry<PaletteAuditGenerateResult>[]>([])
const directionsHistory = ref<PaletteAiResultHistoryEntry<PaletteDirectionsGenerateResult>[]>([])
const rampsHistory = ref<PaletteAiResultHistoryEntry<PaletteRampGenerateResult>[]>([])
const variantsHistory = ref<PaletteAiResultHistoryEntry<PaletteVariantGenerateResult>[]>([])
const historyId = ref(0)
const persistedSessions = useState<Record<string, PaletteAiPersistedSession>>('theme-ai-modal-sessions', () => ({}))

const hasPalette = computed(() => Boolean(props.palette))
const paletteSessionKey = computed(() => {
  if (!props.palette) {
    return null
  }

  return props.palette._id || props.palette.slug || props.palette.name
})
const canGenerateStarter = computed(() => Boolean(starterPrompt.value.trim()) && !isDisabled.value)
const canGenerateRamps = computed(() => rampBrandColors.value.length > 0 && !isDisabled.value)
const canGenerateVariants = computed(() => hasPalette.value && selectedVariantComponents.value.length > 0 && !isDisabled.value)
const componentOptions = computed(() => getComponentThemeEditorDefinitions(props.palette?.components).map(definition => ({
  label: definition.label,
  value: definition.value,
})))
const rampPreviewPalette = computed(() => {
  if (!props.palette || !rampsResult.value) {
    return null
  }

  return createPaletteWithGeneratedRamps(clonePaletteDefinition(props.palette), rampsResult.value.ramps)
})
const variantPreviewPalette = computed(() => {
  if (!props.palette || !variantsResult.value) {
    return null
  }

  return createPaletteWithGeneratedComponents(clonePaletteDefinition(props.palette), variantsResult.value.components)
})

function clearSessionState() {
  auditResult.value = null
  starterResult.value = null
  directionsResult.value = null
  rampsResult.value = null
  variantsResult.value = null
  starterHistory.value = []
  auditHistory.value = []
  directionsHistory.value = []
  rampsHistory.value = []
  variantsHistory.value = []
}

function restorePersistedSession() {
  const sessionKey = paletteSessionKey.value

  if (!sessionKey) {
    clearSessionState()
    return
  }

  const restoredSession = restorePaletteAiSession(persistedSessions.value[sessionKey] ?? createEmptyPersistedAiSession())

  starterHistory.value = restoredSession.starterHistory
  auditHistory.value = restoredSession.auditHistory
  directionsHistory.value = restoredSession.directionsHistory
  rampsHistory.value = restoredSession.rampsHistory
  variantsHistory.value = restoredSession.variantsHistory
  starterResult.value = restoredSession.starterResult
  auditResult.value = restoredSession.auditResult
  directionsResult.value = restoredSession.directionsResult
  rampsResult.value = restoredSession.rampsResult
  variantsResult.value = restoredSession.variantsResult
  historyId.value = restoredSession.historyId
}

function syncPersistedSession() {
  const sessionKey = paletteSessionKey.value

  if (!sessionKey) {
    return
  }

  persistedSessions.value[sessionKey] = buildPaletteAiPersistedSession({
    starterHistory: starterHistory.value,
    starterResult: starterResult.value,
    auditHistory: auditHistory.value,
    auditResult: auditResult.value,
    directionsHistory: directionsHistory.value,
    directionsResult: directionsResult.value,
    rampsHistory: rampsHistory.value,
    rampsResult: rampsResult.value,
    variantsHistory: variantsHistory.value,
    variantsResult: variantsResult.value,
  })
}

watch(open, (value) => {
  if (!value) {
    activeTab.value = 'starter'
    return
  }

  restorePersistedSession()
}, { immediate: false })

watch(paletteSessionKey, () => {
  restorePersistedSession()
}, { immediate: true })

function showValidationToast(title: string, description: string) {
  toast.add({
    title,
    description,
    color: 'warning',
  })
}

function normalizeHexColor(value: string) {
  const color = value.trim().toLowerCase()

  if (!/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/.test(color)) {
    return null
  }

  return color
}

function summarizePrompt(value: string | undefined, fallback: string) {
  const normalized = value?.trim()

  if (!normalized) {
    return fallback
  }

  return normalized.length > 48
    ? `${normalized.slice(0, 48).trimEnd()}...`
    : normalized
}

function getSelectedHistoryId<T>(
  history: PaletteAiResultHistoryEntry<T>[],
  result: T | null,
) {
  return history.find(entry => entry.result === result)?.id ?? null
}

function selectHistoryResult<T>(
  history: PaletteAiResultHistoryEntry<T>[],
  id: number,
) {
  return history.find(entry => entry.id === id)?.result ?? null
}

function addBrandColor(target: Ref<string[]>, input: Ref<string>, label: string) {
  const color = normalizeHexColor(input.value)

  if (!color) {
    showValidationToast('Invalid brand color', `Use a hex color like #0ea5e9 for ${label}.`)
    return
  }

  if (target.value.includes(color)) {
    showValidationToast('Duplicate brand color', `${color} is already included in ${label}.`)
    input.value = ''
    return
  }

  target.value = [...target.value, color]
  input.value = ''
}

function clearStarterResult() {
  starterResult.value = null
  starterHistory.value = []
}

function clearAuditResult() {
  auditResult.value = null
  auditHistory.value = []
}

function clearDirectionsResult() {
  directionsResult.value = null
  directionsHistory.value = []
}

function clearRampsResult() {
  rampsResult.value = null
  rampsHistory.value = []
}

function clearVariantsResult() {
  variantsResult.value = null
  variantsHistory.value = []
}

function pushResultHistory<T>(
  history: Ref<PaletteAiResultHistoryEntry<T>[]>,
  result: T,
  label: string,
  detail?: string,
) {
  historyId.value += 1
  const nextDetail = detail?.trim() || undefined

  history.value = [
    {
      id: historyId.value,
      label,
      createdAt: new Date().toISOString(),
      detail: nextDetail,
      result,
    },
    ...history.value.filter(entry => entry.label !== label || (entry.detail?.trim() || undefined) !== nextDetail),
  ].slice(0, MAX_RESULT_HISTORY)
}

watch([
  paletteSessionKey,
  starterHistory,
  auditHistory,
  directionsHistory,
  rampsHistory,
  variantsHistory,
  starterResult,
  auditResult,
  directionsResult,
  rampsResult,
  variantsResult,
], () => {
  syncPersistedSession()
}, { deep: true })

async function handleAudit() {
  if (!props.palette || isDisabled.value || isAuditLoading.value) {
    return
  }

  isAuditLoading.value = true

  try {
    const result = await generatePaletteAudit({
      palette: clonePaletteDefinition(props.palette),
      prompt: auditPrompt.value.trim() || undefined,
    })
    auditResult.value = result
    pushResultHistory(auditHistory, result, result.summary, summarizePrompt(auditPrompt.value, 'Default repair brief'))
  } catch (error) {
    showErrorToast(error, 'Failed to generate an AI repair pass.')
    await refresh()
  } finally {
    isAuditLoading.value = false
  }
}

function addStarterBrandColor() {
  addBrandColor(starterBrandColors, starterBrandInput, 'starter theme generation')
}

function removeStarterBrandColor(color: string) {
  starterBrandColors.value = starterBrandColors.value.filter(entry => entry !== color)
}

function clearStarterReferenceImage() {
  starterReferenceImage.value = null
}

async function handleStarterImageUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    return
  }

  if (!SUPPORTED_REFERENCE_IMAGE_TYPES.includes(file.type as typeof SUPPORTED_REFERENCE_IMAGE_TYPES[number])) {
    starterReferenceImage.value = null
    showValidationToast('Unsupported image type', 'Use a PNG, JPEG, WEBP, or GIF reference image.')
    input.value = ''
    return
  }

  if (file.size > MAX_REFERENCE_IMAGE_BYTES) {
    starterReferenceImage.value = null
    showValidationToast('Image too large', 'Reference images must be 5 MB or smaller.')
    input.value = ''
    return
  }

  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result ?? ''))
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })
    const [, base64 = ''] = dataUrl.split(',', 2)

    starterReferenceImage.value = {
      data: base64,
      mimeType: file.type || 'image/png',
      name: file.name,
    }
  } catch (error) {
    showErrorToast(error, 'Failed to read the reference image.')
  } finally {
    input.value = ''
  }
}

async function handleStarterTheme() {
  if (!canGenerateStarter.value || isStarterLoading.value) {
    return
  }

  isStarterLoading.value = true

  try {
    const result = await generatePalette({
      prompt: starterPrompt.value.trim(),
      brandColors: starterBrandColors.value.length ? starterBrandColors.value : undefined,
      referenceSummary: starterReferenceSummary.value.trim() || undefined,
      referenceImage: starterReferenceImage.value
        ? {
            data: starterReferenceImage.value.data,
            mimeType: starterReferenceImage.value.mimeType,
          }
        : undefined,
    })
    starterResult.value = result
    pushResultHistory(starterHistory, result, result.name, summarizePrompt(starterPrompt.value, 'Starter theme'))
  } catch (error) {
    showErrorToast(error, 'Failed to generate a starter theme.')
    await refresh()
  } finally {
    isStarterLoading.value = false
  }
}

async function handleDirections() {
  if (!props.palette || isDisabled.value || isDirectionsLoading.value) {
    return
  }

  isDirectionsLoading.value = true

  try {
    const result = await generatePaletteDirections({
      palette: clonePaletteDefinition(props.palette),
      prompt: directionsPrompt.value.trim() || undefined,
      count: directionsCount.value,
    })
    directionsResult.value = result
    pushResultHistory(
      directionsHistory,
      result,
      `${result.directions.length} direction${result.directions.length === 1 ? '' : 's'}`,
      summarizePrompt(directionsPrompt.value, `${directionsCount.value} option request`),
    )
  } catch (error) {
    showErrorToast(error, 'Failed to generate alternative directions.')
    await refresh()
  } finally {
    isDirectionsLoading.value = false
  }
}

function addRampBrandColor() {
  addBrandColor(rampBrandColors, rampInput, 'ramp generation')
}

function removeRampBrandColor(color: string) {
  rampBrandColors.value = rampBrandColors.value.filter(entry => entry !== color)
}

async function handleRamps() {
  if (!canGenerateRamps.value || isRampsLoading.value) {
    return
  }

  isRampsLoading.value = true

  try {
    const result = await generatePaletteRamps({
      paletteName: props.palette?.name,
      brandColors: rampBrandColors.value,
      prompt: rampsPrompt.value.trim() || undefined,
    })
    rampsResult.value = result
    pushResultHistory(
      rampsHistory,
      result,
      `${Object.keys(result.ramps).length} ramp${Object.keys(result.ramps).length === 1 ? '' : 's'}`,
      `${rampBrandColors.value.slice(0, 2).join(', ')}${rampBrandColors.value.length > 2 ? ' +' : ''}`,
    )
  } catch (error) {
    showErrorToast(error, 'Failed to generate color ramps.')
    await refresh()
  } finally {
    isRampsLoading.value = false
  }
}

async function handleVariants() {
  if (!props.palette || !canGenerateVariants.value || isVariantsLoading.value) {
    return
  }

  isVariantsLoading.value = true

  try {
    const result = await generatePaletteVariants({
      prompt: variantsPrompt.value.trim() || 'Generate practical component variants for this palette.',
      palette: clonePaletteDefinition(props.palette),
      componentKeys: selectedVariantComponents.value,
    })
    variantsResult.value = result
    pushResultHistory(
      variantsHistory,
      result,
      result.summary,
      selectedVariantComponents.value.slice(0, 3).join(', '),
    )
  } catch (error) {
    showErrorToast(error, 'Failed to generate component variants.')
    await refresh()
  } finally {
    isVariantsLoading.value = false
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

function applyRampSuggestion() {
  if (!rampsResult.value) {
    return
  }

  applyGeneratedRamps(rampsResult.value.ramps)
  toast.add({
    title: 'Ramps updated',
    description: `Applied AI-generated ramps to ${rampsResult.value.paletteName}.`,
    color: 'success',
  })
  open.value = false
}

function applyVariantSuggestion() {
  if (!variantsResult.value) {
    return
  }

  applyGeneratedComponents(variantsResult.value.components)
  toast.add({
    title: 'Variants updated',
    description: 'Applied the generated component variants to the current draft.',
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
            { label: 'Starter', value: 'starter', slot: 'starter' },
            { label: 'Audit', value: 'audit', slot: 'audit' },
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
              @apply-result="applyPaletteSuggestion($event, 'Applied the generated starter theme to the current draft.')"
            />
          </template>

          <template #audit>
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
                  <ThemeAiSectionHeader
                    title="Suggested fixes"
                    description="Review the token-level changes before applying the patched palette."
                    :action-label="auditResult ? 'Clear result' : undefined"
                    @action="clearAuditResult()"
                  />
                </template>

                <div
                  v-if="auditResult"
                  class="space-y-4"
                >
                  <ThemeAiHistory
                    :entries="auditHistory"
                    :selected-id="getSelectedHistoryId(auditHistory, auditResult)"
                    @select="auditResult = selectHistoryResult(auditHistory, $event)"
                  />

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
              @apply-direction="applyPaletteSuggestion($event.palette, `Applied the ${$event.name} direction to the current draft.`)"
            />
          </template>
        </UTabs>
      </div>
    </template>
  </UModal>
</template>
