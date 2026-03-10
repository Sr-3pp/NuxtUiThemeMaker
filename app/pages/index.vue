<script setup lang="ts">
const {
  currentEditablePalette,
  currentPalette,
  currentPaletteId,
  currentPaletteStatus,
  currentSourcePalette,
  currentMode,
  editorTab,
  filteredPaletteOptions,
  isPaletteImportOpen,
  presetSearch,
  activeOwnedPalette,
  activeOwnedPaletteId,
  copyShareUrl,
  deletePalette,
  disableInteractivePreviews,
  handleAction,
  handleOwnedPaletteSelection,
  handlePaletteSelection,
  handleSignOut,
  importPalette,
  isWorking,
  isAuthenticated,
  ownedPalettes,
  persistVisibility,
  resetCurrentPalette,
  savePalette,
  session,
  updatePaletteToken,
} = useBuilderPage()
</script>

<template>
  <UMain>
    <Navigation
      :current-editable-palette="currentEditablePalette"
      :current-palette="currentPalette"
      :current-palette-status="currentPaletteStatus"
      :current-mode="currentMode"
      :disable-interactive-previews="disableInteractivePreviews"
      :is-authenticated="isAuthenticated"
      :session-email="session?.user.email ?? null"
      :active-owned-palette-slug="activeOwnedPalette?.slug ?? null"
      :active-owned-palette-public="activeOwnedPalette?.isPublic ?? false"
      :is-working="isWorking"
      @copyShareUrl="handleAction(copyShareUrl)"
      @deletePalette="handleAction(deletePalette)"
      @resetCurrentPalette="resetCurrentPalette"
      @openPaletteImport="isPaletteImportOpen = true"
      @openTokensEditor="editorTab = 'tokens'"
      @openExport="editorTab = 'export'"
      @persistVisibility="handleAction(() => persistVisibility($event))"
      @signOut="handleSignOut"
      @toggleInteractivePreviews="disableInteractivePreviews = $event"
    />

    <div class="grid min-h-[calc(100vh-130px)] xl:grid-cols-[256px_minmax(0,1fr)_320px]">
      <PalettePresetSidebar
        v-model:search="presetSearch"
        :active-owned-palette-id="activeOwnedPaletteId"
        :options="filteredPaletteOptions"
        :current-palette-id="currentPaletteId"
        :is-authenticated="isAuthenticated"
        :owned-palettes="ownedPalettes"
        @select="handlePaletteSelection"
        @select-owned-palette="handleOwnedPaletteSelection"
      />

      <UDashboardPanel 
        :ui="{
          root: 'h-screen overflow-auto px-4 pb-8 pt-20'
        }"
      >
        <ThemePreviewPanel :palette="currentPalette" :disable-interactive="disableInteractivePreviews" />
      </UDashboardPanel>

      <ThemeWorkbenchEditor
        v-model:tab="editorTab"
        :palette="currentEditablePalette"
        :source-palette="currentSourcePalette"
        :is-working="isWorking"
        :default-mode="currentMode"
        @save="handleAction(() => savePalette(false))"
        @save-as-new="handleAction(() => savePalette(true))"
        @update-token="updatePaletteToken"
      />
    </div>

    <PaletteImportModal v-model:open="isPaletteImportOpen" @import="importPalette" />
  </UMain>
</template>
