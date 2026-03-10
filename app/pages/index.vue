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
      @resetCurrentPalette="resetCurrentPalette"
      @openPaletteImport="isPaletteImportOpen = true"
      @openTokensEditor="editorTab = 'tokens'"
      @openExport="editorTab = 'export'"
      @toggleInteractivePreviews="disableInteractivePreviews = $event"
    />

    <section class="border-b border-white/10 bg-black/80 px-4 py-3">
      <div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div class="flex flex-wrap items-center gap-2 text-sm text-white/70">
          <UBadge :color="isAuthenticated ? 'primary' : 'neutral'" :variant="isAuthenticated ? 'soft' : 'outline'">
            {{ isAuthenticated ? session?.user.email : 'Guest session' }}
          </UBadge>

          <span v-if="activeOwnedPalette" class="text-white/45">
            Active saved palette: {{ activeOwnedPalette.slug }}
          </span>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <UButton v-if="!isAuthenticated" to="/login?redirect=%2F" color="neutral" variant="outline" type="button">
            Sign in
          </UButton>
          <UButton v-if="!isAuthenticated" to="/register?redirect=%2F" color="primary" class="bg-[#4cd964] text-black hover:bg-[#65e27c]" type="button">
            Sign up
          </UButton>
          <UButton type="button" color="primary" class="bg-[#4cd964] text-black hover:bg-[#65e27c]" :loading="isWorking" @click.prevent="handleAction(() => savePalette(false))">
            Save
          </UButton>
          <UButton type="button" color="neutral" variant="outline" :loading="isWorking" @click.prevent="handleAction(() => savePalette(true))">
            Save As New
          </UButton>
          <UButton
            v-if="activeOwnedPalette"
            type="button"
            color="neutral"
            variant="outline"
            :loading="isWorking"
            @click.prevent="handleAction(() => persistVisibility(!activeOwnedPalette!.isPublic))"
          >
            {{ activeOwnedPalette.isPublic ? 'Make Private' : 'Make Public' }}
          </UButton>
          <UButton
            v-if="activeOwnedPalette?.isPublic"
            type="button"
            color="neutral"
            variant="outline"
            :loading="isWorking"
            @click.prevent="handleAction(copyShareUrl)"
          >
            Copy Share URL
          </UButton>
          <UButton
            v-if="activeOwnedPalette"
            type="button"
            color="error"
            variant="outline"
            :loading="isWorking"
            @click.prevent="handleAction(deletePalette)"
          >
            Delete
          </UButton>
          <UButton v-if="isAuthenticated" type="button" color="neutral" variant="ghost" @click.prevent="handleSignOut">
            Sign out
          </UButton>
        </div>
      </div>
    </section>

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

      <UDashboardPanel>
        <ThemePreviewPanel :palette="currentPalette" :disable-interactive="disableInteractivePreviews" />
      </UDashboardPanel>

      <ThemeWorkbenchEditor
        v-model:tab="editorTab"
        :palette="currentEditablePalette"
        :source-palette="currentSourcePalette"
        :default-mode="currentMode"
        @update-token="updatePaletteToken"
      />
    </div>

    <PaletteImportModal v-model:open="isPaletteImportOpen" @import="importPalette" />
  </UMain>
</template>
