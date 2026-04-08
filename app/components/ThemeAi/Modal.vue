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
) {
  historyId.value += 1
  history.value = [
    {
      id: historyId.value,
      label,
      result,
    },
    ...history.value,
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
    pushResultHistory(auditHistory, result, result.summary)
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
    pushResultHistory(starterHistory, result, result.name)
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
    pushResultHistory(directionsHistory, result, `${result.directions.length} direction${result.directions.length === 1 ? '' : 's'}`)
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
    pushResultHistory(rampsHistory, result, `${Object.keys(result.ramps).length} ramp${Object.keys(result.ramps).length === 1 ? '' : 's'}`)
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
    pushResultHistory(variantsHistory, result, result.summary)
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
            <div class="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <UCard variant="outline" class="rounded-2xl shadow-none">
                <template #header>
                  <div class="flex items-start justify-between gap-3">
                    <div class="space-y-1">
                      <p class="text-sm font-medium text-highlighted">
                        Starter theme input
                      </p>
                      <p class="text-xs text-muted">
                        Generate a full palette from a prompt, optional brand colors, and an optional screenshot or style reference.
                      </p>
                    </div>

                    <UButton
                      v-if="starterResult || starterReferenceImage || starterBrandColors.length || starterReferenceSummary || starterPrompt"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      @click="starterPrompt = ''; starterReferenceSummary = ''; starterBrandColors = []; starterBrandInput = ''; clearStarterReferenceImage(); clearStarterResult()"
                    >
                      Clear
                    </UButton>
                  </div>
                </template>

                <div class="space-y-4">
                  <UTextarea
                    v-model="starterPrompt"
                    :rows="4"
                    class="w-full"
                    placeholder="Example: Turn this fintech dashboard into a calm, data-dense Nuxt UI theme with strong call-to-actions."
                  />

                  <UTextarea
                    v-model="starterReferenceSummary"
                    :rows="3"
                    class="w-full"
                    placeholder="Optional: summarize the reference style, surface treatment, or brand direction."
                  />

                  <div class="space-y-2">
                    <UInput
                      v-model="starterBrandInput"
                      placeholder="#0ea5e9"
                      @keydown.enter.prevent="addStarterBrandColor()"
                    >
                      <template #trailing>
                        <UButton
                          color="primary"
                          variant="link"
                          class="px-0"
                          :disabled="!starterBrandInput.trim()"
                          @click="addStarterBrandColor()"
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
                        v-for="color in starterBrandColors"
                        :key="color"
                        color="neutral"
                        variant="soft"
                        class="gap-2"
                      >
                        <span class="h-3 w-3 rounded-full border border-black/10" :style="{ backgroundColor: color }" />
                        {{ color }}
                        <button type="button" class="leading-none" @click="removeStarterBrandColor(color)">x</button>
                      </UBadge>
                    </div>
                  </div>

                  <div class="space-y-2">
                    <UFormField label="Reference image">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        class="block w-full text-sm text-muted"
                        @change="handleStarterImageUpload"
                      >
                    </UFormField>

                    <p class="text-xs text-muted">
                      Optional. PNG, JPEG, WEBP, or GIF up to 5 MB.
                    </p>

                    <UAlert
                      v-if="starterReferenceImage"
                      color="neutral"
                      variant="soft"
                      icon="i-lucide-image"
                      :title="starterReferenceImage.name"
                      :description="starterReferenceImage.mimeType"
                    >
                      <template #actions>
                        <UButton
                          color="neutral"
                          variant="soft"
                          size="xs"
                          @click="clearStarterReferenceImage()"
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
                    :disabled="!canGenerateStarter"
                    :loading="isStarterLoading"
                    @click="handleStarterTheme()"
                  >
                    Generate starter theme
                  </UButton>
                </div>
              </UCard>

              <UCard variant="outline" class="rounded-2xl shadow-none">
                <template #header>
                  <div class="flex items-start justify-between gap-3">
                    <div class="space-y-1">
                      <p class="text-sm font-medium text-highlighted">
                        Generated starter palette
                      </p>
                      <p class="text-xs text-muted">
                        Apply the generated palette as the current draft.
                      </p>
                    </div>

                    <UButton
                      v-if="starterResult"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      @click="clearStarterResult()"
                    >
                      Clear result
                    </UButton>
                  </div>
                </template>

                <div
                  v-if="starterResult"
                  class="space-y-4"
                >
                  <div
                    v-if="starterHistory.length > 1"
                    class="space-y-2"
                  >
                    <p class="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                      Recent runs
                    </p>
                    <div class="flex flex-wrap gap-2">
                      <UButton
                        v-for="entry in starterHistory"
                        :key="entry.id"
                        size="xs"
                        :color="starterResult === entry.result ? 'primary' : 'neutral'"
                        :variant="starterResult === entry.result ? 'solid' : 'outline'"
                        @click="starterResult = entry.result"
                      >
                        {{ entry.label }}
                      </UButton>
                    </div>
                  </div>

                  <div class="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                    <p class="text-sm font-medium text-highlighted">
                      {{ starterResult.name }}
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
                            :style="{ backgroundColor: starterResult.modes[mode as 'light' | 'dark']?.color?.[token] ?? 'transparent' }"
                          />
                          <p class="text-[10px] uppercase tracking-[0.14em] text-muted">
                            {{ token }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <ThemeAiComparison
                    v-if="props.palette"
                    :from-palette="clonePaletteDefinition(props.palette)"
                    :to-palette="starterResult"
                    title="Starter theme diff"
                  />

                  <ThemeAiLivePreview
                    :palette="starterResult"
                    title="Starter theme preview"
                  />

                  <UButton
                    block
                    color="primary"
                    icon="i-lucide-check"
                    @click="applyPaletteSuggestion(starterResult, 'Applied the generated starter theme to the current draft.')"
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
                  <div class="flex items-start justify-between gap-3">
                    <div class="space-y-1">
                      <p class="text-sm font-medium text-highlighted">
                        Suggested fixes
                      </p>
                      <p class="text-xs text-muted">
                        Review the token-level changes before applying the patched palette.
                      </p>
                    </div>

                    <UButton
                      v-if="auditResult"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      @click="clearAuditResult()"
                    >
                      Clear result
                    </UButton>
                  </div>
                </template>

                <div
                  v-if="auditResult"
                  class="space-y-4"
                >
                  <div
                    v-if="auditHistory.length > 1"
                    class="space-y-2"
                  >
                    <p class="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                      Recent runs
                    </p>
                    <div class="flex flex-wrap gap-2">
                      <UButton
                        v-for="entry in auditHistory"
                        :key="entry.id"
                        size="xs"
                        :color="auditResult === entry.result ? 'primary' : 'neutral'"
                        :variant="auditResult === entry.result ? 'solid' : 'outline'"
                        @click="auditResult = entry.result"
                      >
                        {{ entry.label }}
                      </UButton>
                    </div>
                  </div>

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
            <div class="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <UCard variant="outline" class="rounded-2xl shadow-none">
                <template #header>
                  <div class="flex items-start justify-between gap-3">
                    <div class="space-y-1">
                      <p class="text-sm font-medium text-highlighted">
                        Brand color ramps
                      </p>
                      <p class="text-xs text-muted">
                        Generate full scales from one or more brand anchors and sync their `500` values into semantic colors.
                      </p>
                    </div>

                    <UButton
                      v-if="rampsResult || rampBrandColors.length || rampInput || rampsPrompt"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      @click="rampBrandColors = []; rampInput = ''; rampsPrompt = ''; clearRampsResult()"
                    >
                      Clear
                    </UButton>
                  </div>
                </template>

                <div class="space-y-4">
                  <UInput
                    v-model="rampInput"
                    placeholder="#0ea5e9"
                    @keydown.enter.prevent="addRampBrandColor()"
                  >
                    <template #trailing>
                      <UButton
                        color="primary"
                        variant="link"
                        class="px-0"
                        :disabled="!rampInput.trim()"
                        @click="addRampBrandColor()"
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
                      v-for="color in rampBrandColors"
                      :key="color"
                      color="neutral"
                      variant="soft"
                      class="gap-2"
                    >
                      <span class="h-3 w-3 rounded-full border border-black/10" :style="{ backgroundColor: color }" />
                      {{ color }}
                      <button type="button" class="leading-none" @click="removeRampBrandColor(color)">x</button>
                    </UBadge>
                  </div>

                  <UTextarea
                    v-model="rampsPrompt"
                    :rows="4"
                    class="w-full"
                    placeholder="Example: Keep the ramps crisp and technical, with lighter steps that work well for data-heavy surfaces."
                  />

                  <UButton
                    block
                    color="primary"
                    icon="i-lucide-pipette"
                    :disabled="!canGenerateRamps"
                    :loading="isRampsLoading"
                    @click="handleRamps()"
                  >
                    Generate ramps
                  </UButton>
                </div>
              </UCard>

              <UCard variant="outline" class="rounded-2xl shadow-none">
                <template #header>
                  <div class="flex items-start justify-between gap-3">
                    <div class="space-y-1">
                      <p class="text-sm font-medium text-highlighted">
                        Ramp preview
                      </p>
                      <p class="text-xs text-muted">
                        Review the generated scales before applying them to the current draft.
                      </p>
                    </div>

                    <UButton
                      v-if="rampsResult"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      @click="clearRampsResult()"
                    >
                      Clear result
                    </UButton>
                  </div>
                </template>

                <div
                  v-if="rampsResult"
                  class="space-y-4"
                >
                  <div
                    v-if="rampsHistory.length > 1"
                    class="space-y-2"
                  >
                    <p class="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                      Recent runs
                    </p>
                    <div class="flex flex-wrap gap-2">
                      <UButton
                        v-for="entry in rampsHistory"
                        :key="entry.id"
                        size="xs"
                        :color="rampsResult === entry.result ? 'primary' : 'neutral'"
                        :variant="rampsResult === entry.result ? 'solid' : 'outline'"
                        @click="rampsResult = entry.result"
                      >
                        {{ entry.label }}
                      </UButton>
                    </div>
                  </div>

                  <div
                    v-for="(scale, colorKey) in rampsResult.ramps"
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
                    v-if="props.palette && rampPreviewPalette"
                    :from-palette="clonePaletteDefinition(props.palette)"
                    :to-palette="rampPreviewPalette"
                    title="Ramp diff"
                  />

                  <ThemeAiLivePreview
                    v-if="rampPreviewPalette"
                    :palette="rampPreviewPalette"
                    title="Ramp preview"
                  />

                  <UButton
                    block
                    color="primary"
                    icon="i-lucide-check"
                    @click="applyRampSuggestion()"
                  >
                    Apply ramps
                  </UButton>
                </div>

                <div
                  v-else
                  class="rounded-2xl border border-dashed border-default/70 px-4 py-10 text-center text-sm text-muted"
                >
                  Add one or more brand colors to generate full ramps.
                </div>
              </UCard>
            </div>
          </template>

          <template #variants>
            <div class="grid gap-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
              <UCard variant="outline" class="rounded-2xl shadow-none">
                <template #header>
                  <div class="flex items-start justify-between gap-3">
                    <div class="space-y-1">
                      <p class="text-sm font-medium text-highlighted">
                        Variant brief
                      </p>
                      <p class="text-xs text-muted">
                        Generate component-level styling from a mood, product, or brand prompt.
                      </p>
                    </div>

                    <UButton
                      v-if="variantsResult || variantsPrompt || selectedVariantComponents.length !== 3"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      @click="selectedVariantComponents = ['button', 'input', 'card']; variantsPrompt = ''; clearVariantsResult()"
                    >
                      Reset
                    </UButton>
                  </div>
                </template>

                <div class="space-y-4">
                  <USelectMenu
                    v-model="selectedVariantComponents"
                    :items="componentOptions"
                    multiple
                    value-key="value"
                    placeholder="Choose components"
                  />

                  <UTextarea
                    v-model="variantsPrompt"
                    :rows="6"
                    class="w-full"
                    placeholder="Example: Give buttons and inputs a sharper B2B feel with quieter cards and stronger table hierarchy."
                  />

                  <UButton
                    block
                    color="primary"
                    icon="i-lucide-panels-top-left"
                    :disabled="!canGenerateVariants"
                    :loading="isVariantsLoading"
                    @click="handleVariants()"
                  >
                    Generate variants
                  </UButton>
                </div>
              </UCard>

              <UCard variant="outline" class="rounded-2xl shadow-none">
                <template #header>
                  <div class="flex items-start justify-between gap-3">
                    <div class="space-y-1">
                      <p class="text-sm font-medium text-highlighted">
                        Generated component layer
                      </p>
                      <p class="text-xs text-muted">
                        Apply the generated overrides as a merge on top of the current component theme schema.
                      </p>
                    </div>

                    <UButton
                      v-if="variantsResult"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      @click="clearVariantsResult()"
                    >
                      Clear result
                    </UButton>
                  </div>
                </template>

                <div
                  v-if="variantsResult"
                  class="space-y-4"
                >
                  <div
                    v-if="variantsHistory.length > 1"
                    class="space-y-2"
                  >
                    <p class="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                      Recent runs
                    </p>
                    <div class="flex flex-wrap gap-2">
                      <UButton
                        v-for="entry in variantsHistory"
                        :key="entry.id"
                        size="xs"
                        :color="variantsResult === entry.result ? 'primary' : 'neutral'"
                        :variant="variantsResult === entry.result ? 'solid' : 'outline'"
                        @click="variantsResult = entry.result"
                      >
                        {{ entry.label }}
                      </UButton>
                    </div>
                  </div>

                  <div class="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                    <p class="text-sm font-medium text-highlighted">
                      {{ variantsResult.summary }}
                    </p>
                  </div>

                  <div
                    v-for="(theme, componentKey) in variantsResult.components"
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
                    v-if="props.palette && variantPreviewPalette"
                    :from-palette="clonePaletteDefinition(props.palette)"
                    :to-palette="variantPreviewPalette"
                    title="Variant diff"
                  />

                  <ThemeAiLivePreview
                    v-if="variantPreviewPalette"
                    :palette="variantPreviewPalette"
                    title="Variant preview"
                  />

                  <UButton
                    block
                    color="primary"
                    icon="i-lucide-check"
                    @click="applyVariantSuggestion()"
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

          <template #directions>
            <div class="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <UCard variant="outline" class="rounded-2xl shadow-none">
                <template #header>
                  <div class="flex items-start justify-between gap-3">
                    <div class="space-y-1">
                      <p class="text-sm font-medium text-highlighted">
                        Direction brief
                      </p>
                      <p class="text-xs text-muted">
                        Push the current palette toward new art directions without starting over.
                      </p>
                    </div>

                    <UButton
                      v-if="directionsResult || directionsPrompt || directionsCount !== 3"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      @click="directionsPrompt = ''; directionsCount = 3; clearDirectionsResult()"
                    >
                      Reset
                    </UButton>
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
                <div
                  v-if="directionsHistory.length > 1"
                  class="rounded-2xl border border-default/60 bg-muted/15 px-4 py-3"
                >
                  <p class="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                    Recent runs
                  </p>
                  <div class="mt-2 flex flex-wrap gap-2">
                    <UButton
                      v-for="entry in directionsHistory"
                      :key="entry.id"
                      size="xs"
                      :color="directionsResult === entry.result ? 'primary' : 'neutral'"
                      :variant="directionsResult === entry.result ? 'solid' : 'outline'"
                      @click="directionsResult = entry.result"
                    >
                      {{ entry.label }}
                    </UButton>
                  </div>
                </div>

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

                  <ThemeAiComparison
                    v-if="props.palette"
                    :from-palette="clonePaletteDefinition(props.palette)"
                    :to-palette="direction.palette"
                    :title="`${direction.name} diff`"
                  />

                  <ThemeAiLivePreview
                    :palette="direction.palette"
                    :title="`${direction.name} preview`"
                  />
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
