import type { PaletteDefinition } from '~/types/palette'

export function useBuilderPage() {
  const {
    currentEditablePalette,
    currentPalette,
    currentPaletteId,
    currentPaletteStatus,
    currentSourcePalette,
    handleSelectPalette,
    importPalette: applyImportedPalette,
    removePaletteSource,
    resetCurrentPalette: resetPaletteDraft,
    upsertPaletteSource,
    updatePaletteToken,
  } = usePaletteManager()

  const {
    isAuthenticated,
    refetchSession,
    session,
    signOut: signOutUser,
  } = useAuth()

  const {
    currentMode,
    editorTab,
    filteredPaletteOptions,
    isPaletteImportOpen,
    presetSearch,
  } = useThemeBuilderState()

  const toast = useToast()
  const disableInteractivePreviews = ref(false)

  const {
    activeOwnedPalette,
    activeOwnedPaletteId,
    clearOwnedPalettes,
    copyShareUrl,
    deletePalette,
    isWorking,
    ownedPalettes,
    refreshOwnedPalettes,
    savePalette,
    selectOwnedPalette,
    updateVisibility: persistVisibility,
  } = useOwnedPalettes({
    currentEditablePalette,
    currentPalette,
    currentPaletteId,
    isAuthenticated,
    onApplyPaletteSource: upsertPaletteSource,
    onRemovePaletteSource: removePaletteSource,
    onSelectPalette: handleSelectPalette,
  })

  function showToast(title: string, color: 'success' | 'error' | 'info' = 'info') {
    toast.add({
      title,
      color,
    })
  }

  async function handleAction(action: () => Promise<{ error?: string, message?: string } | void>) {
    const result = await action()

    if (result?.error) {
      showToast(result.error, 'error')
      return false
    }

    if (result?.message) {
      showToast(result.message, 'success')
    }

    return true
  }

  async function handleSignOut() {
    await signOutUser()
    await refetchSession()
    await refreshOwnedPalettes()
    showToast('Signed out.', 'info')
  }

  function importPalette(palette: PaletteDefinition) {
    applyImportedPalette(palette)
    activeOwnedPaletteId.value = null
    isPaletteImportOpen.value = false
    editorTab.value = 'tokens'
  }

  function handlePaletteSelection(id: string) {
    handleSelectPalette(id)

    if (!id.startsWith('saved:')) {
      activeOwnedPaletteId.value = null
    }

    editorTab.value = 'tokens'
  }

  function handleOwnedPaletteSelection(id: string) {
    selectOwnedPalette(id)
    editorTab.value = 'tokens'
  }

  function resetCurrentPalette() {
    resetPaletteDraft()
    editorTab.value = 'tokens'
  }

  watch(isAuthenticated, async (authenticated) => {
    if (!authenticated) {
      clearOwnedPalettes()
      return
    }

    await refreshOwnedPalettes()
  }, { immediate: true })

  return {
    activeOwnedPalette,
    activeOwnedPaletteId,
    copyShareUrl,
    currentEditablePalette,
    currentMode,
    currentPalette,
    currentPaletteId,
    currentPaletteStatus,
    currentSourcePalette,
    disableInteractivePreviews,
    editorTab,
    filteredPaletteOptions,
    handleAction,
    handleOwnedPaletteSelection,
    handlePaletteSelection,
    handleSignOut,
    importPalette,
    isAuthenticated,
    isPaletteImportOpen,
    isWorking,
    ownedPalettes,
    persistVisibility,
    presetSearch,
    resetCurrentPalette,
    savePalette,
    session,
    updatePaletteToken,
    deletePalette,
  }
}
