<script setup lang="ts">
defineOptions({
  name: 'DefaultLayout',
})

const { currentPalette } = usePaletteState()
const { isAiAssistOpen, isQaModalOpen } = useThemeModals()
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />

    <ThemeAiModal
      v-model:open="isAiAssistOpen"
      :palette="currentPalette"
    />

    <ThemeQaModal
      v-model:open="isQaModalOpen"
      :palette="currentPalette"
      :show-repair-action="true"
    />

    <NuxtPage />

    <PaletteLibraryDrawers />
  </UApp>
</template>
