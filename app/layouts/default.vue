<script setup lang="ts">
const { currentPalette, setCurrentPalette } = usePaletteState()

function handlePaletteImport(palette: Parameters<typeof setCurrentPalette>[0]) {
  setCurrentPalette(palette)
}
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />

    <NuxtPage />

    <PaletteOwnDrawer />
    <PaletteDefaultPresetsDrawer />
    <PaletteCommunityDrawer />
    <PaletteHistoryModal />
    <PaletteShareModal />
    <ModalImport @import="handlePaletteImport" />
    <ModalExport :palette="currentPalette" />
    <ModalQa
      :palette="currentPalette"
      :show-repair-action="true"
    />
    <ModalAi
      :palette="currentPalette"
    />
  </UApp>
</template>
