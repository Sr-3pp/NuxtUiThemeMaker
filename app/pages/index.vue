<script setup lang="ts">
const siteConfig = useRuntimeConfig()

usePageSeo({
  title: 'Build and Share Nuxt UI Themes',
  description: 'Create Nuxt UI color palettes with live previews, token editing, export tools, and shareable public links.',
  path: '/',
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteConfig.public.siteName,
      url: siteConfig.public.siteUrl,
      description: siteConfig.public.siteDescription,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      applicationCategory: 'DesignApplication',
      name: siteConfig.public.siteName,
      operatingSystem: 'Web',
      url: siteConfig.public.siteUrl,
      description: 'Interactive Nuxt UI palette builder with previews, token editing, export, and sharing.',
    },
  ],
})

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

    <ThemeWorkspace
      v-model:search="presetSearch"
      v-model:tab="editorTab"
      :active-owned-palette-id="activeOwnedPaletteId"
      :options="filteredPaletteOptions"
      :current-palette-id="currentPaletteId"
      :is-authenticated="isAuthenticated"
      :owned-palettes="ownedPalettes"
      :palette="currentPalette"
      :editable-palette="currentEditablePalette"
      :source-palette="currentSourcePalette"
      :is-working="isWorking"
      :default-mode="currentMode"
      :disable-interactive="disableInteractivePreviews"
      @select="handlePaletteSelection"
      @select-owned-palette="handleOwnedPaletteSelection"
      @save="handleAction(() => savePalette(false))"
      @save-as-new="handleAction(() => savePalette(true))"
      @update-token="updatePaletteToken"
    />

    <PaletteImportModal v-model:open="isPaletteImportOpen" @import="importPalette" />
  </UMain>
</template>
