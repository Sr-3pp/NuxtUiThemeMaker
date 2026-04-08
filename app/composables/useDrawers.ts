export const useDrawers = () => {
  const ownPalettesOpen = useState<boolean>('own-palettes-open', () => false)
  const defaultPresetsOpen = useState<boolean>('default-presets-open', () => false)
  const communityPalettesOpen = useState<boolean>('community-palettes-open', () => false)

  function closeAllDrawers() {
    ownPalettesOpen.value = false
    defaultPresetsOpen.value = false
    communityPalettesOpen.value = false
  }

  function openDrawer(target: typeof ownPalettesOpen | typeof defaultPresetsOpen | typeof communityPalettesOpen) {
    closeAllDrawers()
    target.value = true
  }

  function openOwnPalettes() {
    openDrawer(ownPalettesOpen)
  }

  function openDefaultPresets() {
    openDrawer(defaultPresetsOpen)
  }

  function openCommunityPalettes() {
    openDrawer(communityPalettesOpen)
  }

  return {
    ownPalettesOpen,
    defaultPresetsOpen,
    communityPalettesOpen,
    closeAllDrawers,
    openOwnPalettes,
    openDefaultPresets,
    openCommunityPalettes,
  }
}
