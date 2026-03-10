<script setup lang="ts">
import type { PaletteImportModalEmits, PaletteImportModalProps } from '~/types/palette-components'
import { usePaletteImport } from '~/composables/usePaletteImport'

const props = defineProps<PaletteImportModalProps>()

const emit = defineEmits<PaletteImportModalEmits>()

const isOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value)
})

const {
  activeTab,
  errorMessage,
  handleFileChange,
  importFromSource: submitImport,
  importTabs,
  isImporting,
  rawJson,
  resetState,
  uploadedFileName,
} = usePaletteImport()

watch(() => props.open, (open) => {
  if (!open) {
    resetState()
  }
})

function importFromSource() {
  submitImport((palette) => emit('import', palette))
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
