import { z } from 'zod'
import type { TabsItem } from '@nuxt/ui'
import type { PaletteDefinition } from '~/types/palette'
import type { ImportTab } from '~/types/palette-components'
import { clonePalette } from '~/utils/palette'

const importTabs: TabsItem[] = [
  { label: 'Paste JSON', value: 'paste', slot: 'paste' },
  { label: 'Upload file', value: 'file', slot: 'file' }
]

const paletteImportSchema = z.object({
  name: z.string().trim().min(1, 'Palette name is required'),
  modes: z.object({
    light: z.record(z.string(), z.record(z.string(), z.union([z.string().trim().min(1), z.null()]))),
    dark: z.record(z.string(), z.record(z.string(), z.union([z.string().trim().min(1), z.null()])))
  })
})

function parsePalette(input: string) {
  const parsedJson = JSON.parse(input) as unknown
  return clonePalette(paletteImportSchema.parse(parsedJson) as PaletteDefinition)
}

function getPaletteImportError(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? 'The JSON does not match the palette schema.'
  }

  if (error instanceof SyntaxError) {
    return 'The JSON could not be parsed.'
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Unable to import this palette.'
}

function getImportSource(activeTab: ImportTab, rawJson: string, uploadedFileContent: string) {
  return activeTab === 'paste' ? rawJson : uploadedFileContent
}

function getEmptySourceMessage(activeTab: ImportTab) {
  return activeTab === 'paste'
    ? 'Paste a palette JSON payload first.'
    : 'Choose a JSON file first.'
}

export function usePaletteImport() {
  const activeTab = ref<ImportTab>('paste')
  const rawJson = ref('')
  const uploadedFileName = ref('')
  const uploadedFileContent = ref('')
  const errorMessage = ref('')
  const isImporting = ref(false)

  function resetState() {
    activeTab.value = 'paste'
    rawJson.value = ''
    uploadedFileName.value = ''
    uploadedFileContent.value = ''
    errorMessage.value = ''
    isImporting.value = false
  }

  async function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement | null
    const file = input?.files?.[0]

    uploadedFileName.value = ''
    uploadedFileContent.value = ''
    errorMessage.value = ''

    if (!file) {
      return
    }

    try {
      uploadedFileContent.value = await file.text()
      uploadedFileName.value = file.name
    }
    catch {
      errorMessage.value = 'Unable to read the selected file.'
    }
  }

  function importFromSource(onImport: (palette: PaletteDefinition) => void) {
    errorMessage.value = ''
    isImporting.value = true

    try {
      const source = getImportSource(activeTab.value, rawJson.value, uploadedFileContent.value)

      if (!source.trim()) {
        throw new Error(getEmptySourceMessage(activeTab.value))
      }

      onImport(parsePalette(source))
    }
    catch (error) {
      errorMessage.value = getPaletteImportError(error)
    }
    finally {
      isImporting.value = false
    }
  }

  return {
    activeTab,
    errorMessage,
    handleFileChange,
    importFromSource,
    importTabs,
    isImporting,
    rawJson,
    resetState,
    uploadedFileName,
  }
}
