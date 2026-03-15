<script setup lang="ts">
import type { PaletteDefinition } from '~/types/palette'

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  import: [palette: PaletteDefinition]
}>()

const importInput = ref<HTMLInputElement | null>(null)
const pastedPaletteJson = ref('')

function isPaletteDefinition(value: unknown): value is PaletteDefinition {
  if (!value || typeof value !== 'object') {
    return false
  }

  const palette = value as Partial<PaletteDefinition>

  return typeof palette.name === 'string'
    && Boolean(palette.modes)
    && typeof palette.modes === 'object'
    && Boolean(palette.modes.light)
    && typeof palette.modes.light === 'object'
    && Boolean(palette.modes.dark)
    && typeof palette.modes.dark === 'object'
}

function importPaletteFromContent(content: string) {
  try {
    const parsed = JSON.parse(content) as unknown

    if (!isPaletteDefinition(parsed)) {
      throw new Error('Invalid palette file')
    }

    emit('import', parsed)
    open.value = false
    pastedPaletteJson.value = ''
  }
  catch {
    if (import.meta.client) {
      window.alert('Invalid palette file. Please import a valid palette JSON export.')
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
    accept="application/json,.json"
    class="hidden"
    @change="handlePaletteImport"
  >
  <UModal
    v-model:open="open"
    title="Import palette"
    description="Upload a palette JSON file or paste palette JSON directly."
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

        <div class="space-y-2">
          <p class="text-sm font-medium">
            Paste palette JSON
          </p>
          <UTextarea
            v-model="pastedPaletteJson"
            :rows="12"
            placeholder="{&#10;  &quot;name&quot;: &quot;My Palette&quot;,&#10;  &quot;modes&quot;: { ... }&#10;}"
          />
        </div>

        <UButton
          block
          color="primary"
          :disabled="!pastedPaletteJson.trim()"
          @click="importPaletteFromTextarea()"
        >
          Import pasted JSON
        </UButton>
      </div>
    </template>
  </UModal>
</template>
