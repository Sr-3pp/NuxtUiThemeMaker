<script setup lang="ts">
import type { PaletteDefinition } from '~/types/palette'
import { normalizeImportedPaletteFromText } from '~/utils/palette-io'

const { isOpen: open } = useModal('import-palette')

const emit = defineEmits<{
  import: [palette: PaletteDefinition]
}>()

const importInput = ref<HTMLInputElement | null>(null)
const pastedPaletteJson = ref('')

function importPaletteFromContent(content: string) {
  try {
    const normalizedPalette = normalizeImportedPaletteFromText(content)

    emit('import', normalizedPalette)
    open.value = false
    pastedPaletteJson.value = ''
  }
  catch {
    if (import.meta.client) {
      window.alert('Invalid palette input. Import a valid palette JSON export or CSS variables with :root/.dark blocks.')
    }
  }
}

function openPaletteImport() {
  importInput.value?.click()
}

async function handlePaletteImport(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    return
  }

  try {
    const content = await file.text()
    importPaletteFromContent(content)
  }
  finally {
    input.value = ''
  }
}

function importPaletteFromTextarea() {
  importPaletteFromContent(pastedPaletteJson.value)
}
</script>

<template>
  <input
    ref="importInput"
    type="file"
    accept="application/json,.json,text/css,.css,text/plain,.txt"
    class="hidden"
    @change="handlePaletteImport"
  >
  <UModal
    v-model:open="open"
    title="Import palette"
    description="Upload or paste palette JSON, or CSS variables with :root and optional .dark blocks."
  >
    <template #body>
      <div class="space-y-4">
        <UButton
          block
          color="neutral"
          variant="outline"
          icon="i-lucide-upload"
          @click="openPaletteImport()"
        >
          Upload JSON file
        </UButton>

        <UFormField label="Paste palette JSON">
          <UTextarea
            v-model="pastedPaletteJson"
            class="w-full"
            :rows="12"
            placeholder="{&#10;  &quot;name&quot;: &quot;My Palette&quot;,&#10;  &quot;modes&quot;: { ... }&#10;}&#10;&#10;or&#10;&#10;:root {&#10;  --ui-primary: #11aa55;&#10;}"
          />
        </UFormField>

        <UButton
          block
          color="primary"
          :disabled="!pastedPaletteJson.trim()"
          @click="importPaletteFromTextarea()"
        >
          Import pasted content
        </UButton>
      </div>
    </template>
  </UModal>
</template>
