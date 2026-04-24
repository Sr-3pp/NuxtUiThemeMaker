import { reactive, type Ref } from 'vue'
import type { EditablePalette } from '~/types/palette-editor'
import type { PaletteDefinition } from '~/types/palette'
import type {
  PaletteAiPersistedSession,
  PaletteAiResultHistoryEntry,
  PaletteDirectionsGenerateResult,
  PaletteRampGenerateResult,
  PaletteReferenceImageAsset,
} from '~/types/palette-generation'
import {
  clonePaletteDefinition,
  createPaletteWithGeneratedRamps,
} from '~/utils/palette-domain'
import { attachPaletteRuntimeUi } from '../utils/palette-runtime-ui'
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
import { themeAiMessages, type ThemeAiTab } from '../utils/theme-ai-modal-config'

export function useThemeAiModal(open: Ref<boolean>, palette: Ref<EditablePalette | null>) {
  const toast = useToast()
  const { showErrorToast } = useErrorToast()
  const { generatePalette, generatePaletteDirections, generatePaletteRamps } = usePaletteApi()
  const { applyGeneratedPalette, applyGeneratedRamps } = usePaletteState()
  const access = usePaletteGenerationAccess()

  const activeTab = ref<ThemeAiTab>('starter')
  const starterPrompt = ref('')
  const starterReferenceSummary = ref('')
  const starterBrandColors = ref<string[]>([])
  const starterBrandInput = ref('')
  const starterReferenceImage = ref<PaletteReferenceImageAsset | null>(null)
  const directionsPrompt = ref('')
  const rampsPrompt = ref('')
  const directionsCount = ref<1 | 2 | 3>(3)
  const rampBrandColors = ref<string[]>([])
  const rampInput = ref('')
  const isDirectionsLoading = ref(false)
  const isRampsLoading = ref(false)
  const isStarterLoading = ref(false)
  const starterResult = ref<PaletteDefinition | null>(null)
  const directionsResult = ref<PaletteDirectionsGenerateResult | null>(null)
  const rampsResult = ref<PaletteRampGenerateResult | null>(null)
  const starterHistory = ref<PaletteAiResultHistoryEntry<PaletteDefinition>[]>([])
  const directionsHistory = ref<PaletteAiResultHistoryEntry<PaletteDirectionsGenerateResult>[]>([])
  const rampsHistory = ref<PaletteAiResultHistoryEntry<PaletteRampGenerateResult>[]>([])
  const historyId = ref(0)
  const persistedSessions = useState<Record<string, PaletteAiPersistedSession>>('theme-ai-modal-sessions', () => ({}))

  const hasPalette = computed(() => Boolean(palette.value))
  const paletteSessionKey = computed(() => {
    if (!palette.value) {
      return null
    }

    return palette.value._id || palette.value.slug || palette.value.name
  })
  const canGenerateStarter = computed(() => Boolean(starterPrompt.value.trim()) && !access.isDisabled.value)
  const canGenerateRamps = computed(() => rampBrandColors.value.length > 0 && !access.isDisabled.value)
  const canGenerateFromPalette = computed(() => hasPalette.value && !access.isDisabled.value)
  const rampPreviewPalette = computed(() => {
    if (!palette.value || !rampsResult.value) {
      return null
    }

    return createPaletteWithGeneratedRamps(clonePaletteDefinition(palette.value), rampsResult.value.ramps)
  })

  const sessionState = {
    starterHistory,
    directionsHistory,
    rampsHistory,
    starterResult,
    directionsResult,
    rampsResult,
    historyId,
  }

  watchThemeAiModalSessionPersistence(open, activeTab, paletteSessionKey, sessionState, persistedSessions)

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

  function clearDirectionsResult() {
    clearResult(directionsResult, directionsHistory)
  }

  function clearRampsResult() {
    clearResult(rampsResult, rampsHistory)
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
        const starterPalette = attachPaletteRuntimeUi(result.palette, result.ui)
        starterResult.value = starterPalette
        pushThemeAiResultHistory(starterHistory, historyId, starterPalette, starterPalette.name, summarizeThemeAiPrompt(starterPrompt.value, 'Starter theme'))
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

  function applyPaletteSuggestion(targetPalette: PaletteDefinition, message: string) {
    applyGeneratedPalette(targetPalette)
    closeWithSuccessToast(themeAiMessages.palette.applyTitle, message)
  }

  function applyStarterSuggestion(targetPalette: PaletteDefinition) {
    applyPaletteSuggestion(targetPalette, themeAiMessages.starter.applyDescription)
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

  const starter = reactive({
    prompt: starterPrompt,
    referenceSummary: starterReferenceSummary,
    brandColors: starterBrandColors,
    brandInput: starterBrandInput,
    referenceImage: starterReferenceImage,
    isLoading: isStarterLoading,
    result: starterResult,
    history: starterHistory,
    canGenerate: canGenerateStarter,
    addBrandColor: addStarterBrandColor,
    removeBrandColor: removeStarterBrandColor,
    clearReferenceImage: clearStarterReferenceImage,
    uploadImage: handleStarterImageUpload,
    clearResult: clearStarterResult,
    generate: handleStarterTheme,
    apply: applyStarterSuggestion,
  })

  const directions = reactive({
    prompt: directionsPrompt,
    count: directionsCount,
    isLoading: isDirectionsLoading,
    result: directionsResult,
    history: directionsHistory,
    clearResult: clearDirectionsResult,
    generate: handleDirections,
    apply: applyDirectionSuggestion,
  })

  const ramps = reactive({
    prompt: rampsPrompt,
    brandColors: rampBrandColors,
    brandInput: rampInput,
    isLoading: isRampsLoading,
    result: rampsResult,
    history: rampsHistory,
    canGenerate: canGenerateRamps,
    previewPalette: rampPreviewPalette,
    addBrandColor: addRampBrandColor,
    removeBrandColor: removeRampBrandColor,
    clearResult: clearRampsResult,
    generate: handleRamps,
    apply: applyRampSuggestion,
  })

  return {
    ...access,
    activeTab,
    hasPalette,
    starter,
    directions,
    ramps,
    starterPrompt,
    starterReferenceSummary,
    starterBrandColors,
    starterBrandInput,
    starterReferenceImage,
    directionsPrompt,
    rampsPrompt,
    directionsCount,
    rampBrandColors,
    rampInput,
    isDirectionsLoading,
    isRampsLoading,
    isStarterLoading,
    starterResult,
    directionsResult,
    rampsResult,
    starterHistory,
    directionsHistory,
    rampsHistory,
    canGenerateStarter,
    canGenerateRamps,
    rampPreviewPalette,
    clearStarterResult,
    clearDirectionsResult,
    clearRampsResult,
    addStarterBrandColor,
    removeStarterBrandColor,
    clearStarterReferenceImage,
    handleStarterImageUpload,
    handleStarterTheme,
    handleDirections,
    addRampBrandColor,
    removeRampBrandColor,
    handleRamps,
    applyPaletteSuggestion,
    applyStarterSuggestion,
    applyDirectionSuggestion,
    applyRampSuggestion,
    getSelectedHistoryId: getSelectedThemeAiHistoryId,
    selectHistoryResult: selectThemeAiHistoryResult,
  }
}
