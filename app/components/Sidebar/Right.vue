<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type {
  UpdateEditablePaletteColorScalePayload,
  UpdateEditablePaletteComponentTokenPayload,
  UpdateEditablePaletteTokenPayload,
} from '~/types/palette-editor'

const {
  currentPalette,
  sourcePalette,
  setCurrentPalette,
  updatePalette,
  updatePaletteColorScale,
  updatePaletteComponentToken,
  updatePaletteName,
} = usePaletteState()
const { savePalette, saveNewPalette } = usePaletteApi()
const { editorSidebarSw } = useSidebar()
const { showErrorToast } = useErrorToast()

const saveItems = computed<DropdownMenuItem[][]>(() => [[
  {
    label: 'Save Palette',
    icon: 'i-lucide-save',
    disabled: !currentPalette.value?._id,
    onSelect: async () => {
      if (!currentPalette.value) {
        return
      }

      try {
        const updatedPalette = await savePalette(currentPalette.value)

        if (updatedPalette) {
          setCurrentPalette(updatedPalette)
        }
      } catch (error) {
        showErrorToast(error, 'Failed to save palette.')
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

      try {
        const createdPalette = await saveNewPalette(currentPalette.value)

        if (createdPalette) {
          setCurrentPalette(createdPalette)
        }
      } catch (error) {
        showErrorToast(error, 'Failed to save palette.')
      }
    }
  }
]])

const handleUpdateToken = (event: UpdateEditablePaletteTokenPayload) => {
  const { mode, section, token, value } = event
  updatePalette({mode, section, token, value})
}

const handleUpdateColorScale = (payload: UpdateEditablePaletteColorScalePayload) => {
  updatePaletteColorScale(payload)
}

const handleUpdateComponentToken = (payload: UpdateEditablePaletteComponentTokenPayload) => {
  updatePaletteComponentToken(payload)
}

const handlePaletteNameInput = (event: Event) => {
  updatePaletteName((event.target as HTMLInputElement).value)
}
</script>

<template>
    <UDashboardSidebar id="theme-editor-sidebar" v-model:open="editorSidebarSw" side="right" mode="drawer" resizable :min-size="400">
      <template #header>
        <div class="w-full flex items-center">
          <UIcon class="mr-2" name="i-lucide:palette" />
          <p class="font-medium">
            Theme Editor
          </p>
  
          <UColorModeSwitch class="ml-auto" />
        </div>
      </template>
      <div v-if="currentPalette" class="space-y-4">
        <UFormField label="Palette name">
          <UInput
            :model-value="currentPalette.name"
            placeholder="Untitled palette"
            @input="handlePaletteNameInput"
          />
        </UFormField>

        <ThemeQaPanel :palette="currentPalette" />

        <EditorContent
          :palette="currentPalette"
          :sourcePalette="sourcePalette ?? currentPalette"
          defaultMode="dark"
          tab="tokens"
          @update-token="handleUpdateToken"
          @update-color-scale="handleUpdateColorScale"
          @update-component-token="handleUpdateComponentToken"
        />
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
