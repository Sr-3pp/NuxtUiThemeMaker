import type { PaletteDefinition, PaletteMode, PaletteOptionId, PaletteTokenGroup } from '~/types/palette'
import type { PaletteDraftMap } from '~/types/composables'
import type { UpdatePaletteTokenPayload } from '~/types/theme-builder'
import { clonePalette } from '~/utils/palette'
import { defaultPalette, paletteOptions } from '~/utils/paletteRegistry'

const mirroredSemanticTokens = new Set(['primary', 'secondary', 'neutral', 'success', 'info', 'warning', 'error'])

function hasPaletteOverrides(palette: PaletteDefinition) {
  return Object.values(palette.modes).some(mode =>
    Object.values(mode).some(section =>
      Object.values(section).some(token => token != null)
    )
  )
}

function getTokenGroup(modeDraft: PaletteMode, section: string): PaletteTokenGroup {
  const tokenGroup = modeDraft[section]

  if (!tokenGroup) {
    throw new Error(`Unknown palette section: ${section}`)
  }

  return tokenGroup
}

function applyMirroredTokenUpdate(
  modeDraft: PaletteDefinition['modes']['light'],
  section: string,
  token: string,
  value: string | null
) {
  if (section === 'color' && mirroredSemanticTokens.has(token)) {
    getTokenGroup(modeDraft, 'ui')[token] = value
    return
  }

  if (section === 'ui' && mirroredSemanticTokens.has(token)) {
    getTokenGroup(modeDraft, 'color')[token] = value
    return
  }

  if (section === 'text') {
    getTokenGroup(modeDraft, 'ui')[token === 'default' ? 'text' : `text-${token}`] = value
    return
  }

  if (section === 'bg') {
    getTokenGroup(modeDraft, 'ui')[token === 'default' ? 'bg' : `bg-${token}`] = value
    return
  }

  if (section === 'border') {
    getTokenGroup(modeDraft, 'ui')[token === 'default' ? 'border' : `border-${token}`] = value
    return
  }

  if (section !== 'ui') {
    return
  }

  if (token === 'text' || token.startsWith('text-')) {
    getTokenGroup(modeDraft, 'text')[token === 'text' ? 'default' : token.slice(5)] = value
    return
  }

  if (token === 'bg' || token.startsWith('bg-')) {
    getTokenGroup(modeDraft, 'bg')[token === 'bg' ? 'default' : token.slice(3)] = value
    return
  }

  if (token === 'border' || token.startsWith('border-')) {
    getTokenGroup(modeDraft, 'border')[token === 'border' ? 'default' : token.slice(7)] = value
  }
}

export function usePaletteManager() {
  const currentPaletteId = ref<PaletteOptionId>('default')
  const initialDrafts = Object.fromEntries(
    paletteOptions.map(option => [
      option.id,
      clonePalette(option.type === 'preset' ? option.palette : defaultPalette)
    ])
  ) as PaletteDraftMap
  const paletteDrafts = ref<PaletteDraftMap>(initialDrafts)
  const fallbackDraft = clonePalette(defaultPalette)
  const defaultPaletteOption = paletteOptions.find(option => option.id === 'default')!

  const currentEditablePalette = computed<PaletteDefinition>(() => {
    return paletteDrafts.value[currentPaletteId.value] ?? fallbackDraft
  })
  const currentPaletteOption = computed(() =>
    paletteOptions.find(option => option.id === currentPaletteId.value) ?? defaultPaletteOption
  )
  const currentPalette = computed<PaletteDefinition | null>(() =>
    currentPaletteId.value === 'default' && !hasPaletteOverrides(currentEditablePalette.value)
      ? null
      : currentEditablePalette.value
  )
  const currentPaletteStatus = computed(() =>
    currentPalette.value ? 'Custom palette' : 'Nuxt UI defaults'
  )

  function updateCurrentPalette(palette: PaletteDefinition) {
    paletteDrafts.value[currentPaletteId.value] = clonePalette(palette)
  }

  function updatePaletteToken(payload: UpdatePaletteTokenPayload) {
    const nextDraft = clonePalette(currentEditablePalette.value)
    const modeDraft = nextDraft.modes[payload.mode]
    const targetGroup = getTokenGroup(modeDraft, payload.section)

    targetGroup[payload.token] = payload.value
    applyMirroredTokenUpdate(modeDraft, payload.section, payload.token, payload.value)

    paletteDrafts.value[currentPaletteId.value] = nextDraft
  }

  function importPalette(palette: PaletteDefinition) {
    updateCurrentPalette(palette)
  }

  function selectPalette(id: PaletteOptionId) {
    currentPaletteId.value = id
  }

  function handleSelectPalette(id: string) {
    if (paletteOptions.some(option => option.id === id)) {
      selectPalette(id as PaletteOptionId)
    }
  }

  function resetCurrentPalette() {
    const sourcePalette = currentPaletteOption.value.type === 'preset'
      ? currentPaletteOption.value.palette
      : defaultPalette

    updateCurrentPalette(sourcePalette)
  }

  return {
    currentEditablePalette,
    currentPalette,
    currentPaletteId,
    currentPaletteStatus,
    handleSelectPalette,
    importPalette,
    resetCurrentPalette,
    updateCurrentPalette,
    updatePaletteToken,
  }
}
