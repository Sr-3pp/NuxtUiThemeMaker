<script setup lang="ts">
import type { PaletteDefinition } from '~/types/palette'
import themeBuilder from '~/utils/theme-builder'

const {
  currentEditablePalette,
  currentPalette,
  currentPaletteId,
  currentPaletteStatus,
  handleSelectPalette,
  importPalette: applyImportedPalette,
  resetCurrentPalette: resetPaletteDraft,
  updateCurrentPalette,
  updatePaletteToken,
} = usePaletteManager()

const {
  currentMode,
  editorTab,
  filteredPaletteOptions,
  isPaletteImportOpen,
  presetSearch,
  previewTab,
  previewTabs,
} = useThemeBuilderState()

const disableInteractivePreviews = ref<boolean>(false)
const previewTheme = computed(() => {
  if (!currentPalette.value) {
    return undefined
  }

  return themeBuilder(currentPalette.value.modes[currentMode.value])
})

function importPalette(palette: PaletteDefinition) {
  applyImportedPalette(palette)
  isPaletteImportOpen.value = false
  editorTab.value = 'tokens'
}

function handlePaletteSelection(id: string) {
  handleSelectPalette(id)
  editorTab.value = 'tokens'
}

function resetCurrentPalette() {
  resetPaletteDraft()
  editorTab.value = 'tokens'
}
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <UMain>
      <Navigation
        :current-editable-palette="currentEditablePalette"
        :current-palette="currentPalette"
        :current-palette-status="currentPaletteStatus"
        :current-mode="currentMode"
        @resetCurrentPalette="resetCurrentPalette"
        @openPaletteImport="isPaletteImportOpen = true"
        @openTokensEditor="editorTab = 'tokens'"
        @openExport="editorTab = 'export'"
        @disableInteractivePreviews="disableInteractivePreviews = !disableInteractivePreviews"
      />

      <div class="grid min-h-[calc(100vh-69px)] xl:grid-cols-[256px_minmax(0,1fr)_320px]">
        <PalettePresetSidebar
          v-model:search="presetSearch"
          :options="filteredPaletteOptions"
          :current-palette-id="currentPaletteId"
          @select="handlePaletteSelection"
        />

        <UDashboardPanel>
          <div :style="previewTheme" class="h-full">
            <UTabs
              v-model="previewTab"
              :items="previewTabs"
              color="neutral"
              variant="pill"
              :ui="{
                list: 'inline-flex rounded-2xl border border-white/10 bg-white/5 p-1',
                trigger: 'rounded-xl px-4 py-2 text-sm text-white/60 data-[state=active]:bg-black data-[state=active]:text-white hover:text-white',
                indicator: 'hidden'
              }"
            >

              <template #components>
                <ThemePreviewActions 
                  :disable-interactive="disableInteractivePreviews"
                />
              </template>
              <template #forms>
                <ThemePreviewForms :disable-interactive="disableInteractivePreviews" />
                <ThemePreviewOverlays :disable-interactive="disableInteractivePreviews" />
              </template>
              <template #surfaces>
                <ThemePreviewSurfaces />
                <ThemePreviewFeedback :disable-interactive="disableInteractivePreviews" />
              </template>
              <template #typography>
                <ThemePreviewSurfaces />
              </template>
            </UTabs>
          </div>
        </UDashboardPanel>

        <ThemeWorkbenchEditor
          v-model:tab="editorTab"
          :palette="currentEditablePalette"
          :default-mode="currentMode"
          @update-token="updatePaletteToken"
        />
      </div>
    </UMain>

    <PaletteImportModal
      v-model:open="isPaletteImportOpen"
      @import="importPalette"
    />
  </UApp>
</template>
