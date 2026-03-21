<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { UpdateEditablePaletteTokenPayload } from '~/types/palette-editor'

const { currentPalette, sourcePalette, setCurrentPalette, updatePalette, updatePaletteName } = usePaletteState()
const { savePalette, saveNewPalette } = usePaletteApi()
const { editorSidebarSw } = useSidebar()

const saveItems = computed<DropdownMenuItem[][]>(() => [[
  {
    label: 'Save Palette',
    icon: 'i-lucide-save',
    disabled: !currentPalette.value?._id,
    onSelect: async () => {
      if (!currentPalette.value) {
        return
      }

      const updatedPalette = await savePalette(currentPalette.value)

      if (updatedPalette) {
        setCurrentPalette(updatedPalette)
      }
    }
  },
  {
    label: 'Save as New Palette',
    icon: 'i-lucide-copy-plus',
    onSelect: async () => {
      if (!currentPalette.value) {
        return
      }

      const createdPalette = await saveNewPalette(currentPalette.value)

      if (createdPalette) {
        setCurrentPalette(createdPalette)
      }
    }
  }
]])

const handleUpdateToken = (event: UpdateEditablePaletteTokenPayload) => {
  const { mode, section, token, value } = event
  updatePalette({mode, section, token, value})
}

const handlePaletteNameInput = (event: Event) => {
  updatePaletteName((event.target as HTMLInputElement).value)
}
</script>

<template>
    <UDashboardSidebar id="theme-editor-sidebar" v-model:open="editorSidebarSw" side="right" mode="drawer" resizable>
      <template #header>
        <UIcon name="i-lucide:palette" />
        <p class="font-medium">
          Theme Editor
        </p>
      </template>
      <div v-if="currentPalette" class="space-y-4">
        <UFormField label="Palette name">
          <UInput
            :model-value="currentPalette.name"
            placeholder="Untitled palette"
            @input="handlePaletteNameInput"
          />
        </UFormField>

        <WorkbenchEditorContent :palette="currentPalette" :sourcePalette="sourcePalette ?? currentPalette" defaultMode="dark" tab="tokens" @update-token="handleUpdateToken"/>
      </div>

      <template #footer>
        <UDropdownMenu
          :items="saveItems"
          :ui="{ content: 'w-56' }"
        >
          <UButton class="w-full" icon="i-lucide-save" color="neutral" variant="outline" :disabled="!currentPalette">
            Save
          </UButton>
        </UDropdownMenu>
      </template> 
    </UDashboardSidebar>
</template>
