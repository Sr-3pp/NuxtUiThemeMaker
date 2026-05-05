import type { PreviewAreaKey } from '~/utils/preview-areas'
import { previewAreaDefinitions } from '~/utils/preview-areas'

export function usePreviewAreaState() {
  const selectedArea = useState<PreviewAreaKey>('preview-area', () => 'actions')
  const { openEditorSidebar } = useSidebar()

  const areaOptions = computed(() => previewAreaDefinitions.map(area => ({
    label: area.label,
    value: area.value,
  })))

  const activeArea = computed(() => {
    return previewAreaDefinitions.find(area => area.value === selectedArea.value) ?? previewAreaDefinitions[0]
  })

  watchEffect(() => {
    if (!areaOptions.value.length) {
      return
    }

    if (!areaOptions.value.some(option => option.value === selectedArea.value)) {
      selectedArea.value = areaOptions.value[0]!.value
    }
  })

  function selectArea(area: PreviewAreaKey) {
    selectedArea.value = area
    openEditorSidebar()
  }

  return {
    selectedArea,
    selectArea,
    areaOptions,
    activeArea,
  }
}
