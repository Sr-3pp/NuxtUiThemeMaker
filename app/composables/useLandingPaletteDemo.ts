import type { PaletteDefinition } from '~/types/palette'
import type { StoredPalette } from '~/types/palette-store'
import { FREE_PLAN_PALETTE_GENERATION_LIMIT } from '~/data/pricing'
import { defaultPalettes } from '~/utils/paletteRegistry'
import { clonePaletteDefinition, createEditablePalette } from '~/utils/palette-domain'
import { exportPaletteJson } from '~/utils/paletteExport'

type LandingGenerationStatus = 'idle' | 'loading' | 'success' | 'error'
type LandingPaletteLifecycle = 'temporary' | 'saved' | 'shared' | 'imported'

interface LandingPromptPreset {
  id: string
  label: string
  prompt: string
}

interface LandingGeneratedPaletteState {
  status: LandingGenerationStatus
  prompt: string
  errorMessage: string | null
  palette: PaletteDefinition | null
  generatedAt: string | null
  source: {
    type: 'landing-ai' | 'preset' | 'shared' | 'imported'
    presetId: string | null
    sharedSlug: string | null
  }
  actions: {
    viewedFeatures: boolean
    viewedPricing: boolean
    clickedEdit: boolean
    clickedSave: boolean
    clickedExport: boolean
    clickedSignup: boolean
    regenerateCount: number
  }
  persistence: {
    lifecycle: LandingPaletteLifecycle
    paletteId: string | null
    slug: string | null
  }
}

interface LandingPaletteSessionPayload {
  prompt: string
  selectedPresetId: string | null
  generated: LandingGeneratedPaletteState
}

const LANDING_DEMO_STORAGE_KEY = 'nuxt-ui-theme-builder:landing-demo'

export const landingPromptPresets: LandingPromptPreset[] = [
  {
    id: 'saas-dashboard',
    label: 'SaaS Dashboard',
    prompt: 'Create a confident SaaS dashboard palette with deep blue accents, clean surfaces, and strong readability.',
  },
  {
    id: 'warm-editorial',
    label: 'Warm Editorial',
    prompt: 'Create a warm editorial palette with sand neutrals, terracotta accents, and elegant high-contrast text.',
  },
  {
    id: 'neon-ops',
    label: 'Neon Ops',
    prompt: 'Create a futuristic control-room palette with charcoal surfaces, electric green highlights, and clear focus states.',
  },
  {
    id: 'calm-productivity',
    label: 'Calm Productivity',
    prompt: 'Create a calm productivity app palette with soft stone neutrals, muted teal accents, and relaxed contrast balance.',
  },
]

function getDefaultLandingPalette() {
  return clonePaletteDefinition(defaultPalettes[0]!)
}

function createEmptyGeneratedState(): LandingGeneratedPaletteState {
  return {
    status: 'idle',
    prompt: '',
    errorMessage: null,
    palette: null,
    generatedAt: null,
    source: {
      type: 'landing-ai',
      presetId: null,
      sharedSlug: null,
    },
    actions: {
      viewedFeatures: false,
      viewedPricing: false,
      clickedEdit: false,
      clickedSave: false,
      clickedExport: false,
      clickedSignup: false,
      regenerateCount: 0,
    },
    persistence: {
      lifecycle: 'temporary',
      paletteId: null,
      slug: null,
    },
  }
}

function formatPaletteFileName(name: string) {
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || 'palette'
}

export function useLandingPaletteDemo() {
  const toast = useToast()
  const { generatePalette, saveNewPalette } = usePaletteApi()
  const { user } = useAuth()
  const { setCurrentPalette } = usePaletteState()

  const promptInput = useState('landing-demo-prompt-input', () => landingPromptPresets[0]?.prompt ?? '')
  const selectedPresetId = useState<string | null>('landing-demo-selected-preset', () => landingPromptPresets[0]?.id ?? null)
  const generated = useState<LandingGeneratedPaletteState>('landing-demo-generated', createEmptyGeneratedState)
  const restoredFromSession = useState('landing-demo-restored', () => false)
  const isSaving = ref(false)

  const activePalette = computed(() => generated.value.palette ?? getDefaultLandingPalette())
  const hasGeneratedPalette = computed(() => Boolean(generated.value.palette))
  const isGenerating = computed(() => generated.value.status === 'loading')
  const remainingGuestRunsLabel = `${FREE_PLAN_PALETTE_GENERATION_LIMIT} demo prompts`

  function persistSession() {
    if (!import.meta.client) {
      return
    }

    const payload: LandingPaletteSessionPayload = {
      prompt: promptInput.value,
      selectedPresetId: selectedPresetId.value,
      generated: generated.value,
    }

    sessionStorage.setItem(LANDING_DEMO_STORAGE_KEY, JSON.stringify(payload))
  }

  function restoreSession() {
    if (!import.meta.client || restoredFromSession.value) {
      return
    }

    restoredFromSession.value = true

    const serialized = sessionStorage.getItem(LANDING_DEMO_STORAGE_KEY)

    if (!serialized) {
      return
    }

    try {
      const payload = JSON.parse(serialized) as Partial<LandingPaletteSessionPayload>

      if (typeof payload.prompt === 'string') {
        promptInput.value = payload.prompt
      }

      if (typeof payload.selectedPresetId === 'string' || payload.selectedPresetId === null) {
        selectedPresetId.value = payload.selectedPresetId ?? null
      }

      if (payload.generated && typeof payload.generated === 'object') {
        generated.value = {
          ...createEmptyGeneratedState(),
          ...payload.generated,
          source: {
            ...createEmptyGeneratedState().source,
            ...(payload.generated.source ?? {}),
          },
          actions: {
            ...createEmptyGeneratedState().actions,
            ...(payload.generated.actions ?? {}),
          },
          persistence: {
            ...createEmptyGeneratedState().persistence,
            ...(payload.generated.persistence ?? {}),
          },
        }
      }
    } catch {
      sessionStorage.removeItem(LANDING_DEMO_STORAGE_KEY)
    }
  }

  function setPromptPreset(preset: LandingPromptPreset) {
    selectedPresetId.value = preset.id
    promptInput.value = preset.prompt
    persistSession()
  }

  function applyPaletteState(input: {
    palette: PaletteDefinition
    prompt: string
    sourceType: LandingGeneratedPaletteState['source']['type']
    presetId?: string | null
    sharedSlug?: string | null
    lifecycle?: LandingPaletteLifecycle
    paletteId?: string | null
    slug?: string | null
  }) {
    generated.value = {
      ...generated.value,
      status: 'success',
      prompt: input.prompt,
      errorMessage: null,
      palette: clonePaletteDefinition(input.palette),
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
        errorMessage: 'Enter a prompt to generate a palette.',
      }
      persistSession()
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
      const palette = await generatePalette(prompt)

      applyPaletteState({
        palette,
        prompt,
        sourceType: 'landing-ai',
        presetId: selectedPresetId.value,
      })
    } catch (error) {
      generated.value = {
        ...generated.value,
        status: 'error',
        prompt,
        errorMessage: error instanceof Error ? error.message : 'Failed to generate a palette.',
      }

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
      toast.add({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Failed to save palette.',
        color: 'error',
      })
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
    restoreSession()

    if (!generated.value.palette) {
      return null
    }

    setCurrentPalette(generated.value.palette)
    return generated.value.palette
  }

  watch([promptInput, selectedPresetId, generated], () => {
    persistSession()
  }, { deep: true })

  restoreSession()

  return {
    activePalette,
    generated,
    hasGeneratedPalette,
    isGenerating,
    isSaving,
    promptInput,
    remainingGuestRunsLabel,
    selectedPresetId,
    applySharedPalette,
    exportCurrentPalette,
    generateFromPrompt,
    markFeatureViewed,
    markPricingViewed,
    openEditor,
    restorePaletteForEditor,
    saveCurrentPalette,
    setPromptPreset,
  }
}
