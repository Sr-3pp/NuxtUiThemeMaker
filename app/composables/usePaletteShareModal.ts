import type { StoredPalette } from '~/types/palette-store'

export function usePaletteShareModal() {
  const { sharePalette, unsharePalette } = usePaletteApi()
  const { showErrorToast } = useErrorToast()
  const toast = useToast()
  const { isOpen, open } = useModal('palette-share')
  const { data: userPalettes } = useNuxtData<StoredPalette[]>('user-palettes')

  const sharePaletteTarget = useState<StoredPalette | null>('palette-share-target', () => null)
  const shareEmail = useState<string>('palette-share-email', () => '')
  const isSharing = useState<boolean>('palette-share-loading', () => false)
  const isUnsharing = useState<boolean>('palette-unshare-loading', () => false)

  function syncSharePaletteTarget() {
    if (!sharePaletteTarget.value) {
      return
    }

    const nextPalette = (userPalettes.value ?? []).find(palette => palette._id === sharePaletteTarget.value?._id) ?? null
    sharePaletteTarget.value = nextPalette
  }

  function openPaletteShare(palette: StoredPalette) {
    sharePaletteTarget.value = palette
    shareEmail.value = ''
    open()
  }

  async function handlePaletteShareSubmit() {
    if (!sharePaletteTarget.value) {
      return
    }

    isSharing.value = true

    try {
      await sharePalette(sharePaletteTarget.value._id, {
        email: shareEmail.value,
      })
      syncSharePaletteTarget()
      shareEmail.value = ''
      toast.add({
        title: 'Palette shared',
        description: 'Collaborator access was updated.',
        color: 'success',
      })
    } catch (error) {
      showErrorToast(error, 'Failed to share palette.')
    } finally {
      isSharing.value = false
    }
  }

  async function handlePaletteUnshare(collaboratorUserId: string) {
    if (!sharePaletteTarget.value) {
      return
    }

    isUnsharing.value = true

    try {
      await unsharePalette(sharePaletteTarget.value._id, collaboratorUserId)
      syncSharePaletteTarget()
      toast.add({
        title: 'Access removed',
        description: 'Collaborator access was removed.',
        color: 'success',
      })
    } catch (error) {
      showErrorToast(error, 'Failed to remove collaborator.')
    } finally {
      isUnsharing.value = false
    }
  }

  return {
    sharePaletteTarget,
    shareEmail,
    isSharing,
    isUnsharing,
    isOpen,
    openPaletteShare,
    handlePaletteShareSubmit,
    handlePaletteUnshare,
  }
}
