import type { StoredPalette } from '~/types/palette-store'
import type { PaletteVersionSnapshot } from '~/types/palette-version'

export function usePaletteHistoryModal() {
  const { getPaletteHistory } = usePaletteApi()
  const { showErrorToast } = useErrorToast()
  const { isOpen, open } = useModal('palette-history')

  const historyPalette = useState<StoredPalette | null>('palette-history-target', () => null)
  const paletteHistory = useState<PaletteVersionSnapshot[]>('palette-history-entries', () => [])
  const isHistoryLoading = useState<boolean>('palette-history-loading', () => false)

  async function openPaletteHistory(palette: StoredPalette) {
    historyPalette.value = palette
    open()
    isHistoryLoading.value = true

    try {
      paletteHistory.value = await getPaletteHistory(palette._id)
    } catch (error) {
      paletteHistory.value = []
      showErrorToast(error, 'Failed to load palette history.')
    } finally {
      isHistoryLoading.value = false
    }
  }

  return {
    historyPalette,
    paletteHistory,
    isHistoryLoading,
    isOpen,
    openPaletteHistory,
  }
}
