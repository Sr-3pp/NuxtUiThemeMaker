<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { currentPalette, updatePalette, savePalette, saveNewPalette } = usePalette()
const { editorSidebarSw } = useSidebar()

const saveItems = computed<DropdownMenuItem[][]>(() => [[
  {
    label: 'Save Palette',
    icon: 'i-lucide-save',
    disabled: !currentPalette.value?._id,
    onSelect: async () => {
      await savePalette()
    }
  },
  {
    label: 'Save as New Palette',
    icon: 'i-lucide-copy-plus',
    onSelect: async () => {
      await saveNewPalette()
    }
  }
]])

const handleUpdateToken = (event: H3EventContext) => {
  const { mode, section, token, value } = event
  updatePalette({mode, section, token, value})
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
      <ThemeWorkbenchEditorContent v-if="currentPalette" :palette="currentPalette" :sourcePalette="currentPalette" defaultMode="dark" tab="tokens" @update-token="handleUpdateToken"/>

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
