import type { PaletteDefinition, PaletteMode, PaletteTokenGroup } from '~/types/palette'
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
  const currentPaletteId = ref<string>('default')
  const initialDrafts = Object.fromEntries(
    paletteOptions.map(option => [
      option.id,
      clonePalette(option.type === 'preset' ? option.palette : defaultPalette)
    ])
  ) as PaletteDraftMap
  const paletteSources = ref<PaletteDraftMap>({ ...initialDrafts })
  const paletteDrafts = ref<PaletteDraftMap>(initialDrafts)
  const fallbackDraft = clonePalette(defaultPalette)
  const currentEditablePalette = ref<PaletteDefinition>(clonePalette(initialDrafts.default ?? defaultPalette))
  const currentSourcePalette = computed<PaletteDefinition>(() =>
    paletteSources.value[currentPaletteId.value] ?? defaultPalette
  )

  const currentPalette = computed<PaletteDefinition | null>(() =>
    currentPaletteId.value === 'default' && !hasPaletteOverrides(currentEditablePalette.value)
      ? null
      : currentEditablePalette.value
  )
  const currentPaletteStatus = computed(() =>
    currentPalette.value ? 'Custom palette' : 'Nuxt UI defaults'
  )

  function syncCurrentEditablePalette() {
    currentEditablePalette.value = clonePalette(
      paletteDrafts.value[currentPaletteId.value]
      ?? paletteSources.value[currentPaletteId.value]
      ?? fallbackDraft
    )
  }

  function updateCurrentPalette(palette: PaletteDefinition) {
    const nextPalette = clonePalette(palette)

    currentEditablePalette.value = nextPalette
    paletteDrafts.value = {
      ...paletteDrafts.value,
      [currentPaletteId.value]: clonePalette(nextPalette)
    }
  }

  function updatePaletteToken(payload: UpdatePaletteTokenPayload) {
    const nextDraft = clonePalette(currentEditablePalette.value)
    const modeDraft = nextDraft.modes[payload.mode]
    const targetGroup = getTokenGroup(modeDraft, payload.section)

    targetGroup[payload.token] = payload.value
    applyMirroredTokenUpdate(modeDraft, payload.section, payload.token, payload.value)

    currentEditablePalette.value = nextDraft
    paletteDrafts.value = {
      ...paletteDrafts.value,
      [currentPaletteId.value]: nextDraft
    }
  }

  function importPalette(palette: PaletteDefinition) {
    updateCurrentPalette(palette)
  }

  function selectPalette(id: string) {
    currentPaletteId.value = id
    syncCurrentEditablePalette()
  }

  function handleSelectPalette(id: string) {
    selectPalette(id)
  }

  function resetCurrentPalette() {
    updateCurrentPalette(currentSourcePalette.value)
  }

  function upsertPaletteSource(id: string, palette: PaletteDefinition) {
    const nextPalette = clonePalette(palette)

    paletteSources.value = {
      ...paletteSources.value,
      [id]: nextPalette
    }
    paletteDrafts.value = {
      ...paletteDrafts.value,
      [id]: clonePalette(nextPalette)
    }
  }

  function removePaletteSource(id: string) {
    const { [id]: _removedSource, ...nextSources } = paletteSources.value
    const { [id]: _removedDraft, ...nextDrafts } = paletteDrafts.value

    paletteSources.value = nextSources
    paletteDrafts.value = nextDrafts

    if (currentPaletteId.value === id) {
      currentPaletteId.value = 'default'
    }
  }

  return {
    currentEditablePalette,
    currentPalette,
    currentPaletteId,
    currentPaletteStatus,
    handleSelectPalette,
    importPalette,
    removePaletteSource,
    resetCurrentPalette,
    selectPalette,
    upsertPaletteSource,
    updateCurrentPalette,
    updatePaletteToken,
  }
}
