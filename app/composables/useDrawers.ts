export const useDrawers = () => {
  const ownPalettesOpen = useState<boolean>('own-palettes-open', () => false)
  const defaultPresetsOpen = useState<boolean>('default-presets-open', () => false)
  const communityPalettesOpen = useState<boolean>('community-palettes-open', () => false)

  const closeAllDrawers = () => {
    ownPalettesOpen.value = false
    defaultPresetsOpen.value = false
    communityPalettesOpen.value = false
  }

  const openOwnPalettes = () => {
    closeAllDrawers()
    ownPalettesOpen.value = true
  }

  const openDefaultPresets = () => {
    closeAllDrawers()
    defaultPresetsOpen.value = true
  }

  const openCommunityPalettes = () => {
    closeAllDrawers()
    communityPalettesOpen.value = true
  }

  return {
    ownPalettesOpen,
    defaultPresetsOpen,
    communityPalettesOpen,
    closeAllDrawers,
    openOwnPalettes,
    openDefaultPresets,
    openCommunityPalettes
  }
}