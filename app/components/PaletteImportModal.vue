<script setup lang="ts">
import { z } from 'zod'
import type { TabsItem } from '@nuxt/ui'
import type { PaletteDefinition } from '~/types/palette'
import { clonePalette } from '~/utils/palette'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  import: [palette: PaletteDefinition]
  'update:open': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value)
})

const importTabs: TabsItem[] = [
  { label: 'Paste JSON', value: 'paste', slot: 'paste' },
  { label: 'Upload file', value: 'file', slot: 'file' }
]

const paletteSchema = z.object({
  name: z.string().trim().min(1, 'Palette name is required'),
  modes: z.object({
    light: z.record(z.string(), z.record(z.string(), z.union([z.string().trim().min(1), z.null()]))),
    dark: z.record(z.string(), z.record(z.string(), z.union([z.string().trim().min(1), z.null()])))
  })
})

const activeTab = ref<'paste' | 'file'>('paste')
const rawJson = ref('')
const uploadedFileName = ref('')
const uploadedFileContent = ref('')
const errorMessage = ref('')
const isImporting = ref(false)

watch(() => props.open, (open) => {
  if (open) {
    return
  }

  activeTab.value = 'paste'
  rawJson.value = ''
  uploadedFileName.value = ''
  uploadedFileContent.value = ''
  errorMessage.value = ''
  isImporting.value = false
})

function parsePalette(input: string) {
  const parsedJson = JSON.parse(input) as unknown
  return clonePalette(paletteSchema.parse(parsedJson) as PaletteDefinition)
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

function importFromSource() {
  errorMessage.value = ''
  isImporting.value = true

  try {
    const source = activeTab.value === 'paste' ? rawJson.value : uploadedFileContent.value

    if (!source.trim()) {
      throw new Error(activeTab.value === 'paste'
        ? 'Paste a palette JSON payload first.'
        : 'Choose a JSON file first.')
    }

    emit('import', parsePalette(source))
  }
  catch (error) {
    if (error instanceof z.ZodError) {
      errorMessage.value = error.issues[0]?.message ?? 'The JSON does not match the palette schema.'
    }
    else if (error instanceof SyntaxError) {
      errorMessage.value = 'The JSON could not be parsed.'
    }
    else if (error instanceof Error) {
      errorMessage.value = error.message
    }
    else {
      errorMessage.value = 'Unable to import this palette.'
    }
  }
  finally {
    isImporting.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    title="Import palette"
    description="Paste a palette JSON object or upload a .json file to replace the current draft."
  >
    <template #body>
      <div class="space-y-4 p-1">
        <UAlert
          v-if="errorMessage"
          color="error"
          variant="soft"
          title="Import failed"
          :description="errorMessage"
        />

        <UTabs
          v-model="activeTab"
          :items="importTabs"
          variant="pill"
          color="primary"
          class="space-y-4"
        >
          <template #paste>
            <div class="space-y-2">
              <p class="text-sm text-muted">
                Paste a full `PaletteDefinition` JSON payload.
              </p>
              <textarea
                v-model="rawJson"
                rows="14"
                placeholder="{&#10;  &quot;name&quot;: &quot;My Palette&quot;,&#10;  &quot;modes&quot;: { ... }&#10;}"
                class="w-full rounded-lg border border-default bg-elevated px-4 py-3 font-mono text-xs leading-6 text-toned outline-none"
              />
            </div>
          </template>

          <template #file>
            <div class="space-y-3">
              <p class="text-sm text-muted">
                Upload a `.json` file containing a full palette object.
              </p>
              <UInput
                type="file"
                accept=".json,application/json"
                @change="handleFileChange"
              />
              <div class="rounded-lg border border-default bg-elevated/60 px-3 py-2 text-sm text-muted">
                {{ uploadedFileName || 'No file selected yet.' }}
              </div>
            </div>
          </template>
        </UTabs>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-3">
        <UButton color="neutral" variant="ghost" @click="isOpen = false">
          Cancel
        </UButton>
        <UButton color="primary" :loading="isImporting" @click="importFromSource">
          Import palette
        </UButton>
      </div>
    </template>
  </UModal>
</template>
