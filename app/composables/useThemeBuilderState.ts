import type { TabsItem } from '@nuxt/ui'
import { paletteOptions } from '~/utils/paletteRegistry'

export type PreviewTab = 'components' | 'forms' | 'surfaces' | 'typography'
export type EditorTab = 'tokens' | 'export'

const previewTabs: TabsItem[] = [
  { label: 'Components', value: 'components', slot: 'components' },
  { label: 'Forms', value: 'forms', slot: 'forms' },
  { label: 'Surfaces', value: 'surfaces', slot: 'surfaces' },
  { label: 'Typography', value: 'typography', slot: 'typography' }
]

export function useThemeBuilderState() {
  const colorMode = useColorMode()
  const isPaletteImportOpen = ref(false)
  const presetSearch = ref('')
  const previewTab = ref<PreviewTab>('components')
  const editorTab = ref<EditorTab>('tokens')

  const currentMode = computed<'light' | 'dark'>(() => {
    const resolvedMode = colorMode.unknown ? colorMode.preference : colorMode.value

    return resolvedMode === 'dark' ? 'dark' : 'light'
  })
  const filteredPaletteOptions = computed(() => {
    const query = presetSearch.value.trim().toLowerCase()

    if (!query) {
      return paletteOptions
    }

    return paletteOptions.filter(option =>
      option.name.toLowerCase().includes(query)
    )
  })

  return {
    currentMode,
    editorTab,
    filteredPaletteOptions,
    isPaletteImportOpen,
    presetSearch,
    previewTab,
    previewTabs,
  }
}
