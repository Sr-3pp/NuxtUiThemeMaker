import type { Ref } from 'vue'
import type { EditablePalette } from '~/types/palette-editor'
import type { PaletteDefinition } from '~/types/palette'
import type {
  PaletteAiPersistedSession,
  PaletteAiResultHistoryEntry,
  PaletteAuditGenerateResult,
  PaletteDirectionsGenerateResult,
  PaletteRampGenerateResult,
  PaletteReferenceImageAsset,
  PaletteVariantGenerateResult,
} from '~/types/palette-generation'
import {
  clonePaletteDefinition,
  createPaletteWithGeneratedComponents,
  createPaletteWithGeneratedRamps,
} from '~/utils/palette-domain'
import { auditPaletteTheme } from '../utils/palette-qa'
import { emptyPalette } from '~/utils/paletteRegistry'
import { getComponentThemeEditorDefinitions } from '~/utils/component-theme-editor'
import {
  getSelectedThemeAiHistoryId,
  pushThemeAiResultHistory,
  selectThemeAiHistoryResult,
  summarizeThemeAiPrompt,
} from '~/utils/theme-ai-modal-history'
import {
  addThemeAiBrandColor,
  handleThemeAiReferenceImageUpload,
  removeThemeAiBrandColor,
} from '~/utils/theme-ai-modal-starter'
import {
  watchThemeAiModalSessionPersistence,
} from '~/utils/theme-ai-modal-session'
import { runThemeAiModalAction } from '~/utils/theme-ai-modal-actions'

const themeAiMessages = {
  starter: {
    generateError: 'Failed to generate the starter theme.',
    applyDescription: 'Applied the generated starter theme to the current draft.',
  },
  audit: {
    generateError: 'Failed to generate the audit repair.',
    applyDescription: 'Applied the generated audit repair to the current draft.',
  },
  directions: {
    generateError: 'Failed to generate theme directions.',
    applyDescription: (name: string) => `Applied the ${name} direction to the current draft.`,
  },
  ramps: {
    generateError: 'Failed to generate color ramps.',
    applyTitle: 'Ramps updated',
    applyDescription: (paletteName: string) => `Applied the generated ramps to ${paletteName}.`,
  },
  variants: {
    defaultPrompt: 'Generate practical component variants for this palette.',
    generateError: 'Failed to generate component variants.',
    applyTitle: 'Variants updated',
    applyDescription: 'Applied the generated component variants to the current draft.',
  },
  palette: {
    applyTitle: 'Palette updated',
  },
} as const

export function useThemeAiModal(open: Ref<boolean>, palette: Ref<EditablePalette | null>) {
  const toast = useToast()
  const { showErrorToast } = useErrorToast()
  const { generatePalette, generatePaletteAudit, generatePaletteDirections, generatePaletteRamps, generatePaletteVariants } = usePaletteApi()
  const { applyGeneratedPalette, applyGeneratedComponents, applyGeneratedRamps } = usePaletteState()
  const access = usePaletteGenerationAccess()

  const activeTab = ref<'starter' | 'directions' | 'ramps' | 'variants'>('starter')
  const starterPrompt = ref('')
  const starterReferenceSummary = ref('')
  const starterBrandColors = ref<string[]>([])
  const starterBrandInput = ref('')
  const starterReferenceImage = ref<PaletteReferenceImageAsset | null>(null)
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
  const lastAutoAuditSignature = ref<string | null>(null)
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
  const defaultAuditPaletteSignature = JSON.stringify(clonePaletteDefinition(emptyPalette))

  const hasPalette = computed(() => Boolean(palette.value))
  const paletteSessionKey = computed(() => {
    if (!palette.value) {
      return null
    }

    return palette.value._id || palette.value.slug || palette.value.name
  })
  const canGenerateStarter = computed(() => Boolean(starterPrompt.value.trim()) && !access.isDisabled.value)
  const canGenerateRamps = computed(() => rampBrandColors.value.length > 0 && !access.isDisabled.value)
  const canGenerateVariants = computed(() => hasPalette.value && selectedVariantComponents.value.length > 0 && !access.isDisabled.value)
  const canGenerateFromPalette = computed(() => hasPalette.value && !access.isDisabled.value)
  const isDefaultAuditPalette = computed(() => {
    if (!palette.value) {
      return false
    }

    return JSON.stringify(clonePaletteDefinition(palette.value)) === defaultAuditPaletteSignature
  })
  const auditQaReport = computed(() => hasPalette.value ? auditPaletteTheme(palette.value) : null)
  const canGenerateAudit = computed(() => {
    return canGenerateFromPalette.value
      && !isDefaultAuditPalette.value
      && Boolean(auditQaReport.value?.issues.length)
  })
  const auditIssueSignature = computed(() => {
    if (!palette.value || !auditQaReport.value?.issues.length) {
      return null
    }

    if (isDefaultAuditPalette.value) {
      return null
    }

    return JSON.stringify({
      paletteKey: paletteSessionKey.value,
      issueIds: auditQaReport.value.issues.map(issue => issue.id),
      counts: auditQaReport.value.counts,
    })
  })
  const componentOptions = computed(() => getComponentThemeEditorDefinitions(palette.value?.components).map(definition => ({
    label: definition.label,
    value: definition.value,
  })))
  const rampPreviewPalette = computed(() => {
    if (!palette.value || !rampsResult.value) {
      return null
    }

    return createPaletteWithGeneratedRamps(clonePaletteDefinition(palette.value), rampsResult.value.ramps)
  })
  const variantPreviewPalette = computed(() => {
    if (!palette.value || !variantsResult.value) {
      return null
    }

    return createPaletteWithGeneratedComponents(clonePaletteDefinition(palette.value), variantsResult.value.components)
  })

  const sessionState = {
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
    historyId,
  }

  watchThemeAiModalSessionPersistence(open, activeTab, paletteSessionKey, sessionState, persistedSessions)

  watch([open, auditIssueSignature, access.isDisabled], async ([isOpen, signature, disabled]) => {
    if (!isOpen || disabled || !signature) {
      if (!signature) {
        lastAutoAuditSignature.value = null
      }

      return
    }

    if (lastAutoAuditSignature.value === signature || isAuditLoading.value) {
      return
    }

    lastAutoAuditSignature.value = signature

    const succeeded = await handleAudit()

    if (!succeeded) {
      lastAutoAuditSignature.value = null
    }
  })

  function showValidationToast(title: string, description: string) {
    toast.add({
      title,
      description,
      color: 'warning',
    })
  }

  function addBrandColor(target: Ref<string[]>, input: Ref<string>, label: string) {
    addThemeAiBrandColor(target, input, label, showValidationToast)
  }

  function getCurrentPaletteClone() {
    return palette.value ? clonePaletteDefinition(palette.value) : null
  }

  function clearResult<T>(
    result: Ref<T | null>,
    history: Ref<PaletteAiResultHistoryEntry<T>[]>,
  ) {
    result.value = null
    history.value = []
  }

  function closeWithSuccessToast(title: string, description: string) {
    toast.add({
      title,
      description,
      color: 'success',
    })
    open.value = false
  }

  function clearStarterResult() {
    clearResult(starterResult, starterHistory)
  }

  function clearAuditResult() {
    clearResult(auditResult, auditHistory)
  }

  function clearDirectionsResult() {
    clearResult(directionsResult, directionsHistory)
  }

  function clearRampsResult() {
    clearResult(rampsResult, rampsHistory)
  }

  function clearVariantsResult() {
    clearResult(variantsResult, variantsHistory)
  }

  async function handleAudit() {
    let succeeded = false

    await runThemeAiModalAction({
      loading: isAuditLoading,
      canRun: canGenerateAudit.value,
      execute: async () => {
        const currentPalette = getCurrentPaletteClone()

        if (!currentPalette) {
          return
        }

        if (!auditQaReport.value?.issues.length) {
          showValidationToast('No issues found', 'Theme QA did not flag any issues to send to the AI repair flow.')
          return
        }

        const result = await generatePaletteAudit({
          palette: currentPalette,
        })
        auditResult.value = result
        pushThemeAiResultHistory(
          auditHistory,
          historyId,
          result,
          result.summary,
          `${auditQaReport.value.counts.critical} critical, ${auditQaReport.value.counts.warning} warning`,
        )
        succeeded = true
      },
      handleError: async (error) => {
        showErrorToast(error, themeAiMessages.audit.generateError)
        await access.refresh()
      },
    })

    return succeeded
  }

  function addStarterBrandColor() {
    addBrandColor(starterBrandColors, starterBrandInput, 'starter theme generation')
  }

  function removeStarterBrandColor(color: string) {
    removeThemeAiBrandColor(starterBrandColors, color)
  }

  function clearStarterReferenceImage() {
    starterReferenceImage.value = null
  }

  async function handleStarterImageUpload(event: Event) {
    await handleThemeAiReferenceImageUpload(event, starterReferenceImage, showValidationToast, showErrorToast)
  }

  async function handleStarterTheme() {
    await runThemeAiModalAction({
      loading: isStarterLoading,
      canRun: canGenerateStarter.value,
      execute: async () => {
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
        pushThemeAiResultHistory(starterHistory, historyId, result, result.name, summarizeThemeAiPrompt(starterPrompt.value, 'Starter theme'))
      },
      handleError: async (error) => {
        showErrorToast(error, themeAiMessages.starter.generateError)
        await access.refresh()
      },
    })
  }

  async function handleDirections() {
    await runThemeAiModalAction({
      loading: isDirectionsLoading,
      canRun: canGenerateFromPalette.value,
      execute: async () => {
        const currentPalette = getCurrentPaletteClone()

        if (!currentPalette) {
          return
        }

        const result = await generatePaletteDirections({
          palette: currentPalette,
          prompt: directionsPrompt.value.trim() || undefined,
          count: directionsCount.value,
        })
        directionsResult.value = result
        pushThemeAiResultHistory(
          directionsHistory,
          historyId,
          result,
          `${result.directions.length} direction${result.directions.length === 1 ? '' : 's'}`,
          summarizeThemeAiPrompt(directionsPrompt.value, `${directionsCount.value} option request`),
        )
      },
      handleError: async (error) => {
        showErrorToast(error, themeAiMessages.directions.generateError)
        await access.refresh()
      },
    })
  }

  function addRampBrandColor() {
    addBrandColor(rampBrandColors, rampInput, 'ramp generation')
  }

  function removeRampBrandColor(color: string) {
    removeThemeAiBrandColor(rampBrandColors, color)
  }

  async function handleRamps() {
    await runThemeAiModalAction({
      loading: isRampsLoading,
      canRun: canGenerateRamps.value,
      execute: async () => {
        const result = await generatePaletteRamps({
          paletteName: palette.value?.name,
          brandColors: rampBrandColors.value,
          prompt: rampsPrompt.value.trim() || undefined,
        })
        rampsResult.value = result
        pushThemeAiResultHistory(
          rampsHistory,
          historyId,
          result,
          `${Object.keys(result.ramps).length} ramp${Object.keys(result.ramps).length === 1 ? '' : 's'}`,
          `${rampBrandColors.value.slice(0, 2).join(', ')}${rampBrandColors.value.length > 2 ? ' +' : ''}`,
        )
      },
      handleError: async (error) => {
        showErrorToast(error, themeAiMessages.ramps.generateError)
        await access.refresh()
      },
    })
  }

  async function handleVariants() {
    await runThemeAiModalAction({
      loading: isVariantsLoading,
      canRun: canGenerateVariants.value,
      execute: async () => {
        const currentPalette = getCurrentPaletteClone()

        if (!currentPalette) {
          return
        }

        const result = await generatePaletteVariants({
          prompt: variantsPrompt.value.trim() || themeAiMessages.variants.defaultPrompt,
          palette: currentPalette,
          componentKeys: selectedVariantComponents.value,
        })
        variantsResult.value = result
        pushThemeAiResultHistory(
          variantsHistory,
          historyId,
          result,
          result.summary,
          selectedVariantComponents.value.slice(0, 3).join(', '),
        )
      },
      handleError: async (error) => {
        showErrorToast(error, themeAiMessages.variants.generateError)
        await access.refresh()
      },
    })
  }

  function applyPaletteSuggestion(targetPalette: PaletteDefinition, message: string) {
    applyGeneratedPalette(targetPalette)
    closeWithSuccessToast(themeAiMessages.palette.applyTitle, message)
  }

  function applyStarterSuggestion(targetPalette: PaletteDefinition) {
    applyPaletteSuggestion(targetPalette, themeAiMessages.starter.applyDescription)
  }

  function applyAuditSuggestion(targetPalette: PaletteDefinition) {
    applyPaletteSuggestion(targetPalette, themeAiMessages.audit.applyDescription)
  }

  function applyDirectionSuggestion(direction: { name: string, palette: PaletteDefinition }) {
    applyPaletteSuggestion(direction.palette, themeAiMessages.directions.applyDescription(direction.name))
  }

  function applyRampSuggestion() {
    if (!rampsResult.value) {
      return
    }

    applyGeneratedRamps(rampsResult.value.ramps)
    closeWithSuccessToast(themeAiMessages.ramps.applyTitle, themeAiMessages.ramps.applyDescription(rampsResult.value.paletteName))
  }

  function applyVariantSuggestion() {
    if (!variantsResult.value) {
      return
    }

    applyGeneratedComponents(variantsResult.value.components)
    closeWithSuccessToast(themeAiMessages.variants.applyTitle, themeAiMessages.variants.applyDescription)
  }

  return {
    ...access,
    activeTab,
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
    isAuditLoading,
    isDirectionsLoading,
    isRampsLoading,
    isVariantsLoading,
    isStarterLoading,
    starterResult,
    auditResult,
    directionsResult,
    rampsResult,
    variantsResult,
    starterHistory,
    auditHistory,
    directionsHistory,
    rampsHistory,
    variantsHistory,
    canGenerateStarter,
    canGenerateAudit,
    canGenerateRamps,
    canGenerateVariants,
    auditQaReport,
    isDefaultAuditPalette,
    componentOptions,
    rampPreviewPalette,
    variantPreviewPalette,
    clearStarterResult,
    clearAuditResult,
    clearDirectionsResult,
    clearRampsResult,
    clearVariantsResult,
    addStarterBrandColor,
    removeStarterBrandColor,
    clearStarterReferenceImage,
    handleStarterImageUpload,
    handleStarterTheme,
    handleAudit,
    handleDirections,
    addRampBrandColor,
    removeRampBrandColor,
    handleRamps,
    handleVariants,
    applyPaletteSuggestion,
    applyStarterSuggestion,
    applyAuditSuggestion,
    applyDirectionSuggestion,
    applyRampSuggestion,
    applyVariantSuggestion,
    getSelectedHistoryId: getSelectedThemeAiHistoryId,
    selectHistoryResult: selectThemeAiHistoryResult,
  }
}
