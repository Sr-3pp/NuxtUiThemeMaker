import type {
  LandingGeneratedPaletteState,
  LandingPaletteLifecycle,
} from '~/types/landing-demo'
import type { PaletteDefinition } from '~/types/palette'
import type { StoredPalette } from '~/types/palette-store'
import { FREE_PLAN_PALETTE_GENERATION_LIMIT } from '~/data/pricing'
import { defaultPalettes } from '~/utils/paletteRegistry'
import { clonePaletteDefinition, createEditablePalette } from '~/utils/palette-domain'
import { exportPaletteJson } from '~/utils/paletteExport'
import { attachPaletteRuntimeUi } from '~/utils/palette-runtime-ui'
import type { PaletteUiConfig } from '~/types/palette'
import {
  createEmptyLandingGeneratedState,
} from '~/utils/landing-demo-state'
import {
  persistLandingDemoSession,
  restoreLandingDemoSession,
} from '~/utils/landing-demo-session'

function getDefaultLandingPalette() {
  return clonePaletteDefinition(defaultPalettes[0]!)
}

function formatPaletteFileName(name: string) {
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || 'palette'
}

export function useLandingPaletteWorkflow() {
  const toast = useToast()
  const { showErrorToast } = useErrorToast()
  const { generatePalette, saveNewPalette } = usePaletteApi()
  const { user } = useAuth()
  const { setCurrentPalette } = usePaletteState()
  const { access: generationAccess } = usePaletteGenerationAccess()

  const promptInput = useState('landing-demo-prompt-input', () => '')
  const generated = useState<LandingGeneratedPaletteState>('landing-demo-generated', createEmptyLandingGeneratedState)
  const restoredFromSession = useState('landing-demo-restored', () => false)
  const isSaving = ref(false)

  const activePalette = computed(() => generated.value.palette ?? getDefaultLandingPalette())
  const hasGeneratedPalette = computed(() => Boolean(generated.value.palette))
  const isGenerating = computed(() => generated.value.status === 'loading')
  const remainingGuestRunsLabel = `${FREE_PLAN_PALETTE_GENERATION_LIMIT} demo prompts`

  function persistSession() {
    persistLandingDemoSession({
      prompt: promptInput.value,
      generated: generated.value,
    })
  }

  function restoreSession() {
    if (!import.meta.client || restoredFromSession.value) {
      return
    }

    restoredFromSession.value = true

    const payload = restoreLandingDemoSession()

    if (!payload) {
      return
    }

    if (typeof payload.prompt === 'string') {
      promptInput.value = payload.prompt
    }

    if (payload.generated) {
      generated.value = payload.generated
    }
  }

  function applyPaletteState(input: {
    palette: PaletteDefinition
    ui?: PaletteUiConfig | null
    prompt: string
    sourceType: LandingGeneratedPaletteState['source']['type']
    presetId?: string | null
    sharedSlug?: string | null
    lifecycle?: LandingPaletteLifecycle
    paletteId?: string | null
    slug?: string | null
  }) {
    const palette = attachPaletteRuntimeUi(input.palette, input.ui)

    generated.value = {
      ...generated.value,
      status: 'success',
      prompt: input.prompt,
      errorMessage: null,
      palette: clonePaletteDefinition(palette),
      generatedAt: new Date().toISOString(),
      source: {
        type: input.sourceType,
        presetId: input.presetId ?? null,
        sharedSlug: input.sharedSlug ?? null,
      },
      persistence: {
        lifecycle: input.lifecycle ?? 'temporary',
        paletteId: input.paletteId ?? null,
        slug: input.slug ?? null,
      },
    }

    persistSession()
  }

  async function generateFromPrompt() {
    const prompt = promptInput.value.trim()

    if (!prompt) {
      generated.value = {
        ...generated.value,
        status: 'error',
        errorMessage: null,
      }
      showErrorToast(new Error('Enter a prompt to generate a palette.'), 'Enter a prompt to generate a palette.')
      persistSession()
      return
    }

    // Check if user has access to AI generation
    if (!generationAccess.value.canGenerate) {
      if (generationAccess.value.reason === 'unauthenticated') {
        await navigateTo('/register?redirect=%2F')
        return
      }

      if (generationAccess.value.reason === 'free_limit_reached') {
        showErrorToast(
          new Error('AI generation limit reached. Please upgrade your plan.'),
          'AI generation limit reached. Please upgrade your plan.'
        )
        return
      }

      showErrorToast(
        new Error('You do not have access to AI generation.'),
        'You do not have access to AI generation.'
      )
      return
    }

    generated.value = {
      ...generated.value,
      status: 'loading',
      prompt,
      errorMessage: null,
    }

    persistSession()

    try {
      const result = await generatePalette(prompt)

      applyPaletteState({
        palette: result.palette,
        ui: result.ui,
        prompt,
        sourceType: 'landing-ai',
      })
    } catch (error) {
      generated.value = {
        ...generated.value,
        status: 'error',
        prompt,
        errorMessage: null,
      }

      showErrorToast(error, 'Failed to generate a palette.')
      persistSession()
    }
  }

  function applySharedPalette(palette: StoredPalette) {
    promptInput.value = `Start from ${palette.name}`

    applyPaletteState({
      palette: palette.palette,
      prompt: promptInput.value,
      sourceType: 'shared',
      sharedSlug: palette.slug,
      lifecycle: 'shared',
      paletteId: palette._id,
      slug: palette.slug,
    })
  }

  async function openEditor() {
    if (generated.value.palette) {
      setCurrentPalette(generated.value.palette)
      generated.value.actions.clickedEdit = true
      persistSession()
    }

    await navigateTo('/editor?source=landing')
  }

  async function saveCurrentPalette() {
    generated.value.actions.clickedSave = true
    persistSession()

    if (!generated.value.palette) {
      return
    }

    if (!user.value) {
      generated.value.actions.clickedSignup = true
      persistSession()
      await navigateTo(`/register?redirect=${encodeURIComponent('/editor?source=landing')}`)
      return
    }

    isSaving.value = true

    try {
      const createdPalette = await saveNewPalette(createEditablePalette(generated.value.palette))

      generated.value.persistence = {
        lifecycle: 'saved',
        paletteId: createdPalette._id,
        slug: createdPalette.slug,
      }

      setCurrentPalette(createdPalette)
      persistSession()

      toast.add({
        title: 'Palette saved',
        description: `${createdPalette.name} was added to your library.`,
        color: 'success',
      })
    } catch (error) {
      showErrorToast(error, 'Failed to save palette.')
    } finally {
      isSaving.value = false
    }
  }

  function exportCurrentPalette() {
    if (!generated.value.palette || !import.meta.client) {
      return
    }

    generated.value.actions.clickedExport = true
    persistSession()

    const blob = new Blob([exportPaletteJson(generated.value.palette)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')

    anchor.href = url
    anchor.download = `${formatPaletteFileName(generated.value.palette.name)}.json`
    anchor.click()

    URL.revokeObjectURL(url)
  }

  function markFeatureViewed() {
    generated.value.actions.viewedFeatures = true
    persistSession()
  }

  function markPricingViewed() {
    generated.value.actions.viewedPricing = true
    persistSession()
  }

  function restorePaletteForEditor() {
    if (!generated.value.palette) {
      restoreSession()
    }

    if (!generated.value.palette) {
      return null
    }

    setCurrentPalette(generated.value.palette)
    return generated.value.palette
  }

  watch([promptInput, generated], () => {
    persistSession()
  }, { deep: true })

  if (import.meta.client) {
    onMounted(() => {
      restoreSession()
    })
  }

  return {
    activePalette,
    generated,
    hasGeneratedPalette,
    isGenerating,
    isSaving,
    promptInput,
    remainingGuestRunsLabel,
    applySharedPalette,
    exportCurrentPalette,
    generateFromPrompt,
    markFeatureViewed,
    markPricingViewed,
    openEditor,
    restorePaletteForEditor,
    saveCurrentPalette,
  }
}
