<script setup lang="ts">
const { currentPalette, setCurrentPalette } = usePaletteState()
const route = useRoute()

const showPublicTheme = computed(() => route.path !== '/editor')

function handlePaletteImport(palette: Parameters<typeof setCurrentPalette>[0]) {
  setCurrentPalette(palette)
}
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />

    <PublicThemeShell v-if="showPublicTheme">
      <PublicNavbar />
      <NuxtPage />
    </PublicThemeShell>
    <NuxtPage v-else />

    <PaletteOwnDrawer />
    <PaletteDefaultPresetsDrawer />
    <PaletteCommunityDrawer />
    <PaletteHistoryModal />
    <PaletteShareModal />
    <ModalImport @import="handlePaletteImport" />
    <ModalContribute />
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
